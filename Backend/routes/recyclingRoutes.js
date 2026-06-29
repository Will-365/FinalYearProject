import express from 'express';
import {
  getNearestCenters,
  getCenter,
  createCenter,
  scheduleDropOff,
  getMyDropOffs,
  cancelDropOff,
} from '../controllers/recyclingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public (authenticated) routes
router.get('/centers/nearest', protect, getNearestCenters);
router.get('/centers/:id', protect, getCenter);

// Admin-only route
router.post('/centers', protect, authorize('admin'), createCenter);

// Resident-only routes
router.post('/drop-offs', protect, authorize('resident'), scheduleDropOff);
router.get('/drop-offs', protect, authorize('resident'), getMyDropOffs);
router.patch('/drop-offs/:id/cancel', protect, authorize('resident'), cancelDropOff);

export default router;
