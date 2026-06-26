import mongoose from 'mongoose';

const pointsLedgerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['earned', 'spent', 'debit'],
      required: true,
    },
    source: {
      type: String,
      enum: ['waste_scan', 'collection_confirmed', 'collection_approved', 'registration_bonus', 'coupon_claim', 'referral', 'product_purchase'],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const PointsLedger = mongoose.model('PointsLedger', pointsLedgerSchema);
export default PointsLedger;
