import mongoose from 'mongoose';

const userCouponSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    pointsSpent: {
      type: Number,
      required: true,
      default: 0,
    },
    source: {
      type: String,
      enum: ['points_claim', 'admin_reward'],
      default: 'points_claim',
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    collectionRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionRequest',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'used', 'expired'],
      default: 'active',
    },
    usedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const UserCoupon = mongoose.model('UserCoupon', userCouponSchema);
export default UserCoupon;
