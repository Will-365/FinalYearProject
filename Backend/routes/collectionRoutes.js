import express from 'express';
import {
  requestCollection,
  getMyCollectionRequests,
  getCollectionRequestById,
  cancelCollectionRequest,
  confirmCollection,
  getCollectionSchedules,
  getScheduleById,
} from '../controllers/collectionController.js';
import { reportBinStatus, getMyBinStatus } from '../controllers/binStatusController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('resident'));

// Collection Requests
router.post('/request', requestCollection);
router.get('/my-requests', getMyCollectionRequests);
router.get('/request/:id', getCollectionRequestById);
router.patch('/request/:id/cancel', cancelCollectionRequest);
router.post('/request/:id/confirm', confirmCollection);

// Bin status reporting
router.post('/bin-status', reportBinStatus);
router.get('/bin-status/me', getMyBinStatus);

// Collection Schedules (read-only for residents)
router.get('/schedules', getCollectionSchedules);
router.get('/schedule/:id', getScheduleById);

export default router;
