import mongoose from 'mongoose';

/**
 * Processing stages for waste-to-product pipeline:
 *  received → sorting → curing → forming → packaging → product (ready for sale)
 */
const wasteCategoryIntakeSchema = new mongoose.Schema(
  {
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

    // ── Core waste data ──────────────────────────────────────
    wasteType: {
      type: String,
      enum: ['organic', 'inorganic', 'hazardous', 'recyclable', 'mixed'],
      required: true,
    },
    weightKg: { type: Number, required: true, min: 0 },
    volumeLiters: { type: Number, default: null },

    // ── Quantity discrepancy (collector reports) ─────────────
    // Resident-declared quantity from the collection request
    declaredQuantity: {
      type: String,
      enum: ['small', 'medium', 'large', null],
      default: null,
    },
    // Actual weight the collector found on arrival
    actualWeightKg: { type: Number, default: null },
    hasDiscrepancy: { type: Boolean, default: false },
    discrepancyNote: { type: String, default: null }, // collector's note to admin
    // Admin decision after reviewing discrepancy
    discrepancyResolved: { type: Boolean, default: false },
    discrepancyResolution: {
      type: String,
      enum: ['award_full', 'award_less', 'award_more', 'no_change', null],
      default: null,
    },
    pointsOverride: { type: Number, default: null }, // admin sets exact points if overriding
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },

    // ── Location ─────────────────────────────────────────────
    location: {
      province: String,
      district: String,
      sector: String,
    },
    intakeDate: { type: Date, required: true, default: Date.now },

    // ── Waste-to-product processing pipeline ─────────────────
    processingStatus: {
      type: String,
      enum: ['received', 'sorting', 'curing', 'forming', 'packaging', 'product', 'disposed'],
      default: 'received',
    },
    processingHistory: [
      {
        stage:     { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note:      { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // ── Conversion to product ────────────────────────────────
    convertedToProduct: { type: Boolean, default: false },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    convertedAt: { type: Date, default: null },
    convertedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

wasteCategoryIntakeSchema.index({ wasteType: 1, processingStatus: 1 });
wasteCategoryIntakeSchema.index({ hasDiscrepancy: 1, discrepancyResolved: 1 });
wasteCategoryIntakeSchema.index({ collectionRequest: 1 });

const WasteCategoryIntake = mongoose.model('WasteCategoryIntake', wasteCategoryIntakeSchema);
export default WasteCategoryIntake;
