import User from '../../models/User.js';
import generateToken from '../../utils/generateToken.js';

// POST /api/admin/auth/login
// Admin login — no OTP required; admins are created directly in DB or via seed
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid credentials or insufficient privileges' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This admin account has been deactivated' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/auth/me
export const getAdminProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry -otpAttempts -resetOtp -resetOtpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/auth/profile
export const updateAdminProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Admin not found' });

    const { fullName, phone, notificationPrefs } = req.body;
    if (fullName?.trim()) user.fullName = fullName.trim();
    if (phone?.trim()) user.phone = phone.trim();
    if (notificationPrefs) user.notificationPrefs = { ...user.notificationPrefs?.toObject?.() || user.notificationPrefs || {}, ...notificationPrefs };

    await user.save();
    res.status(200).json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    next(error);
  }
};
