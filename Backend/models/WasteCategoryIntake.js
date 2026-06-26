import mongoose from 'mongoose';

const wasteCategoryIntakeSchema = new mongoose.Schema(
  {
    // Recorded by which collector or admin
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collectionRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionRequest',
      default: null,
    },
    wasteType: {
      type: String,
      enum: ['organic', 'inorganic', 'hazardous', 'recyclable', 'mixed'],
      required: true,
    },
    weightKg: {
      type: Number,
      required: true,
      min: 0,
    },
    volumeLiters: {
      type: Number,
      default: null,
    },
    location: {
      province: String,
      district: String,
      sector: String,
    },
    intakeDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    processingStatus: {
      type: String,
      enum: ['received', 'processing', 'processed', 'disposed', 'converted'],
      default: 'received',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    convertedAt: { type: Date, default: null },
    notes: { type: String },
  },
  { timestamps: true }
);

const WasteCategoryIntake = mongoose.model('WasteCategoryIntake', wasteCategoryIntakeSchema);
export default WasteCategoryIntake;
