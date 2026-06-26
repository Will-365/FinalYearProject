import express from 'express';
import {
  getWasteIntakeLog,
  getWasteIntakeAnalytics,
  logWasteIntake,
  updateIntakeStatus,
} from '../../controllers/admin/adminWasteIntakeController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/analytics', getWasteIntakeAnalytics);
router.get('/', getWasteIntakeLog);
router.post('/', logWasteIntake);
router.patch('/:id/status', updateIntakeStatus);

export default router;
