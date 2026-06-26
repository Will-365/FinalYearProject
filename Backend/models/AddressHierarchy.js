import mongoose from 'mongoose';

const addressHierarchySchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ['province', 'district', 'sector', 'cell', 'village'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Parent references for hierarchy traversal
    province: { type: String, default: null },
    district:  { type: String, default: null },
    sector:    { type: String, default: null },
    cell:      { type: String, default: null },

    // Operational metadata
    isActive: { type: Boolean, default: true },
    collectionDays: [
      {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
    ],
    assignedCollector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: { type: String, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index so names are unique within a parent scope
addressHierarchySchema.index({ level: 1, name: 1, province: 1, district: 1, sector: 1, cell: 1 }, { unique: true });

const AddressHierarchy = mongoose.model('AddressHierarchy', addressHierarchySchema);
export default AddressHierarchy;
