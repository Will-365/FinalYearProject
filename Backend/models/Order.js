import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // Either a registered User OR a buyer (identified by phone)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // For public buyers who place orders without a full account
    buyerPhone:    { type: String, default: '' },
    buyerName:     { type: String, default: '' },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: { type: Number, default: 1, min: 1 },

    paymentMethod: {
      type: String,
      enum: ['points', 'mobile_money', 'cash'],
      required: true,
    },
    pointsUsed:  { type: Number, default: 0 },
    cashAmount:  { type: Number, default: 0 },
    mobileMoneyPhone: { type: String, default: '' }, // phone for mobile money payment

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'ready', 'fulfilled', 'cancelled'],
      default: 'pending',
    },
    trackingNote:  { type: String, default: '' },
    cancelReason:  { type: String, default: '' },
    deliveryNote:  { type: String, default: '' },
    deliveryAddress: {
      province: String,
      district: String,
      sector:   String,
      street:   String,
    },

    confirmedAt:  { type: Date, default: null },
    fulfilledAt:  { type: Date, default: null },
    processedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ buyerPhone: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
