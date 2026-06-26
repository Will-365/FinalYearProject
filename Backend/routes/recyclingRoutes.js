import express from 'express';
import {
  getNearestCenters,
  getCenter,
  scheduleDropOff,
  getMyDropOffs,
  cancelDropOff,
} from '../controllers/recyclingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/centers/nearest', protect, getNearestCenters);
router.get('/centers/:id', protect, getCenter);

router.use(protect);
router.use(authorize('resident'));

router.post('/drop-offs', scheduleDropOff);
router.get('/drop-offs', getMyDropOffs);
router.patch('/drop-offs/:id/cancel', cancelDropOff);

export default router;
