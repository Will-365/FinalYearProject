import express from 'express';
import {
  getAdminSchedules,
  createAdminSchedule,
  updateAdminSchedule,
  deleteAdminSchedule,
} from '../../controllers/admin/adminScheduleController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/', getAdminSchedules);
router.post('/', createAdminSchedule);
router.put('/:id', updateAdminSchedule);
router.delete('/:id', deleteAdminSchedule);

export default router;
