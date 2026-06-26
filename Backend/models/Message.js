import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 2000 },
    readByRecipient: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ recipient: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
