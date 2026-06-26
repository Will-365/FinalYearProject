import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: { type: Number, default: 1, min: 1 },
    paymentMethod: {
      type: String,
      enum: ['points', 'phone', 'cash'],
      required: true,
    },
    pointsUsed: { type: Number, default: 0 },
    cashAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'fulfilled', 'cancelled'],
      default: 'pending',
    },
    deliveryNote: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
