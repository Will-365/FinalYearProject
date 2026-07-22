import mongoose from 'mongoose';

/**
 * Resident-reported household bin fill level / criticalness.
 * Admins monitor the latest report per resident for dispatch planning.
 */
const binStatusReportSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fillPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    /** Visual / operational status */
    status: {
      type: String,
      enum: ['empty', 'partial', 'full', 'overdue'],
      required: true,
      index: true,
    },
    /** How urgent the resident feels the situation is */
    criticalness: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
      index: true,
    },
    wasteType: {
      type: String,
      enum: ['organic', 'inorganic', 'mixed', 'hazardous', 'recyclable'],
      default: 'mixed',
    },
    note: {
      type: String,
      maxlength: 300,
      default: '',
    },
    location: {
      province: String,
      district: String,
      sector: String,
      cell: String,
      village: String,
      street: String,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

binStatusReportSchema.index({ resident: 1, reportedAt: -1 });
binStatusReportSchema.index({ status: 1, criticalness: 1, reportedAt: -1 });

export default mongoose.model('BinStatusReport', binStatusReportSchema);
