import Coupon from '../models/Coupon.js';
import UserCoupon from '../models/UserCoupon.js';
import User from '../models/User.js';
import { spendPoints, getPointsBalance } from '../utils/pointsService.js';
import crypto from 'crypto';

// Generate a unique coupon redemption code
const generateCouponCode = () => {
  return 'GC-' + crypto.randomBytes(6).toString('hex').toUpperCase();
};

// GET /api/coupons
export const getAvailableCoupons = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {
      isActive: true,
      expiresAt: { $gt: new Date() },
      $or: [{ totalAvailable: -1 }, { $expr: { $lt: ['$totalClaimed', '$totalAvailable'] } }],
    };

    if (category) filter.category = category;

    const [coupons, total] = await Promise.all([
      Coupon.find(filter).sort({ pointsRequired: 1 }).skip(skip).limit(parseInt(limit)),
      Coupon.countDocuments(filter),
    ]);

    // Get user points for context
    const balance = await getPointsBalance(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        coupons: coupons.map((c) => ({
          ...c.toObject(),
          canClaim: balance ? balance.current >= c.pointsRequired : false,
        })),
        userPoints: balance?.current || 0,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/coupons/:id/claim
export const claimCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    if (!coupon.isActive || coupon.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon is no longer available' });
    }

    if (coupon.totalAvailable !== -1 && coupon.totalClaimed >= coupon.totalAvailable) {
      return res.status(400).json({ success: false, message: 'This coupon has been fully claimed' });
    }

    // Check if user already claimed this coupon
    const alreadyClaimed = await UserCoupon.findOne({ user: req.user.id, coupon: coupon._id, status: 'active' });
    if (alreadyClaimed) {
      return res.status(400).json({ success: false, message: 'You have already claimed this coupon' });
    }

    // Deduct points
    const success = await spendPoints(
      req.user.id,
      coupon.pointsRequired,
      'coupon_claim',
      coupon._id,
      `Claimed coupon: ${coupon.title}`
    );

    if (!success) {
      const balance = await getPointsBalance(req.user.id);
      return res.status(400).json({
        success: false,
        message: `Insufficient points. You need ${coupon.pointsRequired} points but have ${balance?.current || 0}.`,
      });
    }

    // Issue coupon to user
    const code = generateCouponCode();
    const userCoupon = await UserCoupon.create({
      user: req.user.id,
      coupon: coupon._id,
      code,
      pointsSpent: coupon.pointsRequired,
      expiresAt: coupon.expiresAt,
    });

    // Increment claimed count on coupon
    await Coupon.findByIdAndUpdate(coupon._id, { $inc: { totalClaimed: 1 } });

    res.status(201).json({
      success: true,
      message: `Coupon claimed successfully! Use code ${code} at ${coupon.partner}.`,
      data: {
        couponCode: code,
        title: coupon.title,
        description: coupon.description,
        discountValue: coupon.discountValue,
        discountType: coupon.discountType,
        partner: coupon.partner,
        expiresAt: coupon.expiresAt,
        pointsSpent: coupon.pointsRequired,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/coupons/my-coupons
export const getMyCoupons = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { user: req.user.id };
    if (status) filter.status = status;

    // Auto-expire coupons past their expiry date
    await UserCoupon.updateMany(
      { user: req.user.id, status: 'active', expiresAt: { $lt: new Date() } },
      { status: 'expired' }
    );

    const [userCoupons, total] = await Promise.all([
      UserCoupon.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('coupon', 'title description discountValue discountType partner category imageUrl'),
      UserCoupon.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        coupons: userCoupons,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
