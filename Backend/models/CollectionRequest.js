import mongoose from 'mongoose';

const collectionRequestSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    wasteType: {
      type: String,
      enum: ['organic', 'inorganic', 'mixed', 'hazardous', 'recyclable'],
      required: true,
    },
    quantity: {
      type: String,
      enum: ['small', 'medium', 'large'],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTimeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    location: {
      province: String,
      district: String,
      sector: String,
      cell: String,
      village: String,
      street: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    collectionNote: {
      type: String,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    residentConfirmed: {
      type: Boolean,
      default: false,
    },
    residentConfirmedAt: {
      type: Date,
      default: null,
    },
    adminApproved: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    adminNotes: {
      type: String,
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    wasteScan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteScan',
      default: null,
    },
  },
  { timestamps: true }
);

const CollectionRequest = mongoose.model('CollectionRequest', collectionRequestSchema);
export default CollectionRequest;
