import express from 'express';
import {
  getAllCollectionRequests,
  getCollectionRequestById,
  assignPickup,
  unassignPickup,
  setRequestPriority,
  updateRequestStatus,
  approveCollection,
  getCollectionSummary,
} from '../../controllers/admin/adminCollectionController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/summary', getCollectionSummary);
router.get('/', getAllCollectionRequests);
router.get('/:id', getCollectionRequestById);
router.post('/:id/assign', assignPickup);
router.patch('/:id/unassign', unassignPickup);
router.patch('/:id/priority', setRequestPriority);
router.patch('/:id/status', updateRequestStatus);
router.post('/:id/approve', approveCollection);

export default router;
