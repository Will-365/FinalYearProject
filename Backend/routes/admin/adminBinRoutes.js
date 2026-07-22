import express from 'express';
import {
  getBinStatusSummary,
  getBinStatuses,
  getBinStatusById,
} from '../../controllers/admin/adminBinController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/summary', getBinStatusSummary);
router.get('/', getBinStatuses);
router.get('/:id', getBinStatusById);

export default router;
