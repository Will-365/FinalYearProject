import mongoose from 'mongoose';

const wasteScanSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    wasteType: {
      type: String,
      enum: ['organic', 'inorganic', 'hazardous', 'recyclable', 'unknown'],
      required: true,
    },
    confidence: {
      type: Number, // 0-100
      default: 0,
    },
    recommendation: {
      type: String,
      required: true,
    },
    binColor: {
      type: String, // e.g., 'green' for organic, 'blue' for inorganic
    },
    detectedItems: [String], // items Gemini identified in the image
    pointsEarned: {
      type: Number,
      default: 0,
    },
    rawGeminiResponse: {
      type: String,
    },
  },
  { timestamps: true }
);

const WasteScan = mongoose.model('WasteScan', wasteScanSchema);
export default WasteScan;
