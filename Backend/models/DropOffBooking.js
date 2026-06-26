import mongoose from 'mongoose';

const dropOffBookingSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecyclingCenter',
      required: true,
    },
    scheduledDate: { type: Date, required: true },
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    materialType: {
      type: String,
      enum: ['plastic', 'paper', 'glass', 'metal', 'organic', 'electronics', 'textiles', 'mixed'],
      required: true,
    },
    estimatedWeight: { type: Number, min: 0, default: 0 },
    notes: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

dropOffBookingSchema.index({ resident: 1, scheduledDate: -1 });

const DropOffBooking = mongoose.model('DropOffBooking', dropOffBookingSchema);
export default DropOffBooking;
