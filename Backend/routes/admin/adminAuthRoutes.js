import express from 'express';
import { adminLogin, getAdminProfile, updateAdminProfile } from '../../controllers/admin/adminAuthController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/me', protect, authorize('admin'), getAdminProfile);
router.put('/profile', protect, authorize('admin'), updateAdminProfile);

export default router;
