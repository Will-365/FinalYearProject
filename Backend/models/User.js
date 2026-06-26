import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    nationalId: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['resident', 'collector', 'business', 'admin'],
      default: 'resident',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpiry: {
      type: Date,
      default: null,
    },
    resetOtpAttempts: {
      type: Number,
      default: 0,
    },
    notificationPrefs: {
      collections: { type: Boolean, default: true },
      rewards: { type: Boolean, default: true },
      news: { type: Boolean, default: false },
    },
    location: {
      province: String,
      district: String,
      sector: String,
      cell: String,
      village: String,
      street: String,
    },
    points: {
      type: Number,
      default: 0,
    },
    totalPointsEarned: {
      type: Number,
      default: 0,
    },
    totalWasteScans: {
      type: Number,
      default: 0,
    },
    totalCollections: {
      type: Number,
      default: 0,
    },
    // Collector-specific fields
    isActive: {
      type: Boolean,
      default: true,
    },
    collectorZone: {
      province: String,
      district: String,
      sector: String,
    },
    vehicleType: {
      type: String,
      enum: ['truck', 'van', 'motorcycle', 'bicycle', 'on_foot'],
      default: 'motorcycle',
    },
    collectorStatus: {
      type: String,
      enum: ['available', 'on_route', 'offline'],
      default: 'available',
    },
    totalPickups: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
// NOTE: User model already supports role='admin' — add it to enum
