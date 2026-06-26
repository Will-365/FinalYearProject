import crypto from 'crypto';
import Coupon from '../models/Coupon.js';
import UserCoupon from '../models/UserCoupon.js';
import { createNotification } from './notificationService.js';

const generateCouponCode = () => `GC-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

/**
 * Grant a coupon to a resident without deducting points (admin reward after collection).
 */
export const grantCouponToUser = async (userId, couponId, options = {}) => {
  const { collectionRequestId = null, grantedBy = null } = options;

  const coupon = await Coupon.findById(couponId);
  if (!coupon || !coupon.isActive) {
    throw new Error('Coupon template not found or inactive');
  }
  if (coupon.expiresAt < new Date()) {
    throw new Error('Coupon template has expired');
  }
  if (coupon.totalAvailable !== -1 && coupon.totalClaimed >= coupon.totalAvailable) {
    throw new Error('Coupon template is fully claimed');
  }

  const code = generateCouponCode();
  const userCoupon = await UserCoupon.create({
    user: userId,
    coupon: coupon._id,
    code,
    pointsSpent: 0,
    expiresAt: coupon.expiresAt,
    source: 'admin_reward',
    grantedBy,
    collectionRequest: collectionRequestId,
  });

  await Coupon.findByIdAndUpdate(coupon._id, { $inc: { totalClaimed: 1 } });

  await createNotification({
    userId,
    type: 'reward',
    title: 'New reward coupon!',
    message: `You earned "${coupon.title}" for your collection. Code: ${code}`,
    relatedId: userCoupon._id,
    relatedModel: 'UserCoupon',
  });

  return { userCoupon, coupon, code };
};

/**
 * Pick the best matching reward coupon template for a waste type.
 */
export const findRewardCouponForWaste = async (wasteType) => {
  const categoryMap = {
    organic: 'food',
    recyclable: 'shopping',
    inorganic: 'shopping',
    mixed: 'other',
    hazardous: 'other',
  };
  const category = categoryMap[wasteType] || 'other';

  let coupon = await Coupon.findOne({
    isActive: true,
    expiresAt: { $gt: new Date() },
    category,
    $or: [{ totalAvailable: -1 }, { $expr: { $lt: ['$totalClaimed', '$totalAvailable'] } }],
  }).sort({ createdAt: -1 });

  if (!coupon) {
    coupon = await Coupon.findOne({
      isActive: true,
      expiresAt: { $gt: new Date() },
      $or: [{ totalAvailable: -1 }, { $expr: { $lt: ['$totalClaimed', '$totalAvailable'] } }],
    }).sort({ createdAt: -1 });
  }

  return coupon;
};
