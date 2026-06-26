import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    pointsRequired: {
      type: Number,
      required: true,
    },
    discountValue: {
      type: Number, // percentage or fixed amount
      required: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    partner: {
      type: String, // business/partner name
      required: true,
    },
    category: {
      type: String,
      enum: ['food', 'transport', 'utilities', 'shopping', 'health', 'other'],
      default: 'other',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    totalAvailable: {
      type: Number,
      default: -1, // -1 means unlimited
    },
    totalClaimed: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
