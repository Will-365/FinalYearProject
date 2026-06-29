import mongoose from 'mongoose';

const recyclingCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    district: { type: String, default: 'Kigali' },
    sector: { type: String, default: '' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    acceptedMaterials: [{ type: String }],
    hours: { type: String, default: '8:00 AM - 5:00 PM' },
    phone: { type: String, default: '' },
    isOpen: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

recyclingCenterSchema.index({ district: 1, isActive: 1 });

const RecyclingCenter = mongoose.model('RecyclingCenter', recyclingCenterSchema);
export default RecyclingCenter;
