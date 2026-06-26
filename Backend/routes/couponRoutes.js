import express from 'express';
import { getAvailableCoupons, claimCoupon, getMyCoupons } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const router = express.Router();

// Limit coupon claims to prevent abuse
const claimLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many coupon claims. Please try again later.' },
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
});

router.use(protect);
router.use(authorize('resident'));

router.get('/', getAvailableCoupons);
router.post('/:id/claim', claimLimiter, claimCoupon);
router.get('/my-coupons', getMyCoupons);

export default router;
