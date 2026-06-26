import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import {
  register, verifyOTP, resendOTP, login,
  getMe, updateProfile, changePassword,
  forgotPassword, verifyResetOTP, resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many accounts created from this IP, please try again after an hour' },
});

const validateRegister = [
  body('fullName').notEmpty().withMessage('Full name is required').isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone is required').matches(/^\+250[0-9]{9}$/).withMessage('Phone must be in format +250XXXXXXXXX'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
  body('role').isIn(['resident', 'collector', 'business']).withMessage('Invalid role'),
  (req, res, next) => {
    import('express-validator').then(({ validationResult }) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const message = errors.array().map(err => err.msg).join(', ');
        return res.status(400).json({ success: false, message });
      }
      next();
    });
  }
];

const validateLogin = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    import('express-validator').then(({ validationResult }) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const message = errors.array().map(err => err.msg).join(', ');
        return res.status(400).json({ success: false, message });
      }
      next();
    });
  }
];

router.post('/register', registerLimiter, validateRegister, register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginLimiter, validateLogin, login);

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.patch('/password', protect, changePassword);

export default router;
