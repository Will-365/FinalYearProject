import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Buyer — a public user who can browse and purchase recycled products.
 * Deliberately lightweight: no email, no national ID, no OTP verification.
 * Just fullName + phone + password.
 */
const buyerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2,  'Full name must be at least 2 characters'],
      maxlength: [80, 'Full name cannot exceed 80 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      // Accepts +250XXXXXXXXX or 07XXXXXXXX
      match: [/^(\+250|07)\d{8,9}$/, 'Phone must be a valid Rwanda number (+250XXXXXXXXX or 07XXXXXXXX)'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },

    // Delivery preference (optional — can be filled later)
    preferredDistrict: { type: String, default: '' },
    preferredSector:   { type: String, default: '' },

    isActive:  { type: Boolean, default: true },
    lastLogin: { type: Date,    default: null  },

    // Reset password
    resetOtp:          { type: String,  default: null },
    resetOtpExpiry:    { type: Date,    default: null },
    resetOtpAttempts:  { type: Number,  default: 0   },
  },
  { timestamps: true }
);

// Hash password before save
buyerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

buyerSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Buyer = mongoose.model('Buyer', buyerSchema);
export default Buyer;
