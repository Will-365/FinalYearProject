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
      district: { type: String, required: true, index: true },
      sector: String,
      cell: String,
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    /** Coarse slot for filtering */
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    /** Exact clock times shown to residents (HH:mm) */
    startTime: {
      type: String,
      default: '',
    },
    endTime: {
      type: String,
      default: '',
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
      index: true,
    },
    notes: {
      type: String,
      maxlength: 500,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

collectionScheduleSchema.index({ 'zone.district': 1, scheduledDate: 1, status: 1 });

const CollectionSchedule = mongoose.model('CollectionSchedule', collectionScheduleSchema);
export default CollectionSchedule;
