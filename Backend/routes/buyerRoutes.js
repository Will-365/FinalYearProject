import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerBuyer,
  loginBuyer,
  getBuyerProfile,
  updateBuyerProfile,
  forgotBuyerPassword,
  resetBuyerPassword,
} from '../controllers/buyerAuthController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many registration attempts. Try again in an hour.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

// ── Public ────────────────────────────────────────────────────
// POST /api/buyers/register
router.post('/register', registerLimiter, registerBuyer);

// POST /api/buyers/login
router.post('/login', loginLimiter, loginBuyer);

// POST /api/buyers/forgot-password
router.post('/forgot-password', forgotBuyerPassword);

// POST /api/buyers/reset-password
router.post('/reset-password', resetBuyerPassword);

// ── Protected (buyer must be logged in) ───────────────────────
// GET /api/buyers/me
router.get('/me', protect, authorize('buyer'), getBuyerProfile);

// PUT /api/buyers/me
router.put('/me', protect, authorize('buyer'), updateBuyerProfile);

export default router;
