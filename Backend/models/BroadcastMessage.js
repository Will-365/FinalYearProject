import mongoose from 'mongoose';

const broadcastMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 2000 },
    audience: {
      type: String,
      enum: ['all', 'residents', 'collectors', 'zone'],
      default: 'all',
    },
    targetDistrict: { type: String, default: null },
    targetSector: { type: String, default: null },
    type: {
      type: String,
      enum: ['info', 'urgent', 'reward', 'system'],
      default: 'info',
    },
    recipientCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const BroadcastMessage = mongoose.model('BroadcastMessage', broadcastMessageSchema);
export default BroadcastMessage;
