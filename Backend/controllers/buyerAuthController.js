import Buyer from '../models/Buyer.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import generateOTP from '../utils/generateOTP.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/buyers/register
// ─────────────────────────────────────────────────────────────────────────────
export const registerBuyer = async (req, res, next) => {
  try {
    const { fullName, phone, password, preferredDistrict, preferredSector } = req.body;

    // ── Validation ──────────────────────────────────────────
    const errors = [];
    if (!fullName?.trim())         errors.push('Full name is required');
    if (!phone?.trim())            errors.push('Phone number is required');
    if (!password)                 errors.push('Password is required');
    if (password && password.length < 6) errors.push('Password must be at least 6 characters');

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join('. ') });
    }

    // ── Uniqueness check ────────────────────────────────────
    const existing = await Buyer.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A buyer account with this phone number already exists' });
    }

    const buyer = await Buyer.create({
      fullName: fullName.trim(),
      phone:    phone.trim(),
      password,
      preferredDistrict: preferredDistrict?.trim() || '',
      preferredSector:   preferredSector?.trim()   || '',
    });

    const token = generateToken(buyer._id, 'buyer');

    res.status(201).json({
      success: true,
      message: 'Account created successfully. You can now browse and buy eco products!',
      token,
      buyer: {
        id:       buyer._id,
        fullName: buyer.fullName,
        phone:    buyer.phone,
        role:     'buyer',
        preferredDistrict: buyer.preferredDistrict,
        preferredSector:   buyer.preferredSector,
        createdAt: buyer.createdAt,
      },
    });
  } catch (error) {
    // MongoDB duplicate key
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors).map(e => e.message).join('. ');
      return res.status(400).json({ success: false, message: msg });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/buyers/login
// ─────────────────────────────────────────────────────────────────────────────
export const loginBuyer = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
    }

    const buyer = await Buyer.findOne({ phone: phone.trim() }).select('+password');
    if (!buyer) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }

    if (!buyer.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact support.' });
    }

    const isMatch = await buyer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }

    buyer.lastLogin = new Date();
    await buyer.save({ validateBeforeSave: false });

    const token = generateToken(buyer._id, 'buyer');

    res.status(200).json({
      success: true,
      message: `Welcome back, ${buyer.fullName}!`,
      token,
      buyer: {
        id:       buyer._id,
        fullName: buyer.fullName,
        phone:    buyer.phone,
        role:     'buyer',
        preferredDistrict: buyer.preferredDistrict,
        preferredSector:   buyer.preferredSector,
        lastLogin: buyer.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/buyers/me  (protected)
// ─────────────────────────────────────────────────────────────────────────────
export const getBuyerProfile = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.user.id);
    if (!buyer) return res.status(404).json({ success: false, message: 'Buyer not found' });

    res.status(200).json({
      success: true,
      buyer: {
        id:       buyer._id,
        fullName: buyer.fullName,
        phone:    buyer.phone,
        role:     'buyer',
        preferredDistrict: buyer.preferredDistrict,
        preferredSector:   buyer.preferredSector,
        createdAt:  buyer.createdAt,
        lastLogin:  buyer.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/buyers/me  (protected) — update profile
// ─────────────────────────────────────────────────────────────────────────────
export const updateBuyerProfile = async (req, res, next) => {
  try {
    const { fullName, preferredDistrict, preferredSector } = req.body;
    const buyer = await Buyer.findById(req.user.id);
    if (!buyer) return res.status(404).json({ success: false, message: 'Buyer not found' });

    if (fullName?.trim()) buyer.fullName = fullName.trim();
    if (preferredDistrict !== undefined) buyer.preferredDistrict = preferredDistrict;
    if (preferredSector   !== undefined) buyer.preferredSector   = preferredSector;

    await buyer.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: 'Profile updated',
      buyer: {
        id: buyer._id, fullName: buyer.fullName, phone: buyer.phone,
        preferredDistrict: buyer.preferredDistrict, preferredSector: buyer.preferredSector,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/buyers/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
export const forgotBuyerPassword = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone?.trim()) return res.status(400).json({ success: false, message: 'Phone is required' });

    const buyer = await Buyer.findOne({ phone: phone.trim() });
    // Always respond the same way to avoid enumeration
    if (!buyer) {
      return res.status(200).json({ success: true, message: 'If that phone number is registered, you will receive a reset code via SMS' });
    }

    const otp = generateOTP();
    const salt = await bcrypt.genSalt(10);
    buyer.resetOtp          = await bcrypt.hash(String(otp), salt);
    buyer.resetOtpExpiry    = Date.now() + 10 * 60 * 1000; // 10 min
    buyer.resetOtpAttempts  = 0;
    await buyer.save({ validateBeforeSave: false });

    // In production integrate an SMS provider (e.g. Africa's Talking) here
    // For now we return the OTP in dev mode only
    const responsePayload = { success: true, message: 'Password reset code generated. Use it within 10 minutes.' };
    if (process.env.NODE_ENV === 'development') {
      responsePayload.devOtp = otp; // Remove in production
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/buyers/reset-password
// ─────────────────────────────────────────────────────────────────────────────
export const resetBuyerPassword = async (req, res, next) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'phone, otp, and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const buyer = await Buyer.findOne({ phone: phone.trim() }).select('+password');
    if (!buyer || !buyer.resetOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
    }

    if (buyer.resetOtpAttempts >= 5) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Request a new reset code.' });
    }

    if (buyer.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'Reset code has expired. Request a new one.' });
    }

    const isMatch = await bcrypt.compare(String(otp), buyer.resetOtp);
    if (!isMatch) {
      buyer.resetOtpAttempts += 1;
      await buyer.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: 'Invalid reset code' });
    }

    buyer.password          = newPassword; // pre-save hook hashes it
    buyer.resetOtp          = null;
    buyer.resetOtpExpiry    = null;
    buyer.resetOtpAttempts  = 0;
    await buyer.save();

    res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};
