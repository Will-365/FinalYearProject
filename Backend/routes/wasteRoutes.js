import express from 'express';
import { scanWaste, getScanHistory, getScanById } from '../controllers/wasteController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const router = express.Router();

// Rate limit: max 30 scans per hour per user
const scanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many scan requests. Please try again later.' },
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
});

// All routes require authentication and resident role
router.use(protect);
router.use(authorize('resident'));

router.post('/scan', scanLimiter, scanWaste);
router.get('/history', getScanHistory);
router.get('/scan/:id', getScanById);

export default router;
