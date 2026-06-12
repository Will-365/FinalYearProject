import User from '../models/User.js';
import generateOTP from '../utils/generateOTP.js';
import generateToken from '../utils/generateToken.js';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/emailService.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, nationalId, password, role, location } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const nationalIdExists = await User.findOne({ nationalId });
    if (nationalIdExists) {
      return res.status(400).json({ success: false, message: 'National ID already registered' });
    }

    const otp = generateOTP();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    const user = await User.create({
      fullName,
      email,
      phone,
      nationalId,
      password,
      role,
      location,
      otp: hashedOtp,
      otpExpiry,
    });

    try {
      await sendOTPEmail(user.email, user.fullName, otp);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      // We still return 201 so the user can be created and try resend OTP
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the verification code.',
      email: user.email,
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Please register again.' });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ success: false, message: `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.` });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    try {
      await sendWelcomeEmail(user.email, user.fullName, user.role);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const otp = generateOTP();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);
    
    user.otp = hashedOtp;
    user.otpAttempts = 0;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      await sendOTPEmail(user.email, user.fullName, otp);
    } catch (error) {
      console.error('Error sending resend OTP email:', error);
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    next(error);
  }
};
