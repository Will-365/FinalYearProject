import express from 'express';
import { getAdminCoupons, createAdminCoupon, grantCoupon, getRecentGrants } from '../../controllers/admin/adminCouponController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/', getAdminCoupons);
router.get('/grants', getRecentGrants);
router.post('/', createAdminCoupon);
router.post('/:id/grant', grantCoupon);

export default router;
