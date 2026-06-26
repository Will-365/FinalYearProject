import Coupon from '../../models/Coupon.js';
import UserCoupon from '../../models/UserCoupon.js';
import { grantCouponToUser } from '../../utils/couponRewardService.js';

// GET /api/admin/coupons
export const getAdminCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { coupons } });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/coupons
export const createAdminCoupon = async (req, res, next) => {
  try {
    const { title, description, pointsRequired, discountValue, discountType, partner, category, expiresAt, totalAvailable, imageUrl } = req.body;
    if (!title || !description || !partner || !expiresAt) {
      return res.status(400).json({ success: false, message: 'title, description, partner, and expiresAt are required' });
    }
    const coupon = await Coupon.create({
      title,
      description,
      pointsRequired: parseInt(pointsRequired) || 0,
      discountValue: parseFloat(discountValue) || 10,
      discountType: discountType || 'percentage',
      partner,
      category: category || 'other',
      expiresAt: new Date(expiresAt),
      totalAvailable: totalAvailable != null ? parseInt(totalAvailable) : -1,
      imageUrl: imageUrl || '',
      isActive: true,
    });
    res.status(201).json({ success: true, message: 'Coupon template created', data: coupon });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/coupons/:id/grant
export const grantCoupon = async (req, res, next) => {
  try {
    const { userId, collectionRequestId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    const result = await grantCouponToUser(userId, req.params.id, {
      collectionRequestId,
      grantedBy: req.user.id,
    });
    res.status(201).json({
      success: true,
      message: `Coupon "${result.coupon.title}" granted — code ${result.code}`,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/admin/coupons/grants — recent admin-granted coupons
export const getRecentGrants = async (req, res, next) => {
  try {
    const grants = await UserCoupon.find({ source: 'admin_reward' })
      .populate('user', 'fullName email')
      .populate('coupon', 'title discountValue discountType partner')
      .populate('collectionRequest', 'wasteType status')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: { grants } });
  } catch (error) {
    next(error);
  }
};
