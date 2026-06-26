import mongoose from 'mongoose';

const collectionScheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    zone: {
      province: String,
      district: String,
      sector: String,
      cell: String,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    wasteTypes: [
      {
        type: String,
        enum: ['organic', 'inorganic', 'mixed', 'hazardous', 'recyclable'],
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'in_progress', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    notes: {
      type: String,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDays: [
      {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
    ],
  },
  { timestamps: true }
);

const CollectionSchedule = mongoose.model('CollectionSchedule', collectionScheduleSchema);
export default CollectionSchedule;
