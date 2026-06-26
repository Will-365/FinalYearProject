import express from 'express';
import {
  getAllCollectors,
  getCollectorById,
  createCollector,
  updateCollector,
  deleteCollector,
  updateCollectorStatus,
} from '../../controllers/admin/adminCollectorController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getAllCollectors);
router.post('/', createCollector);
router.get('/:id', getCollectorById);
router.put('/:id', updateCollector);
router.delete('/:id', deleteCollector);
router.patch('/:id/status', updateCollectorStatus);

export default router;
