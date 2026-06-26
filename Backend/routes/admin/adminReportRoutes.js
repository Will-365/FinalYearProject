import express from 'express';
import { getAdminReport } from '../../controllers/reportsController.js';
import { sendBroadcast, getBroadcasts } from '../../controllers/messagingController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAdminReport);
router.get('/broadcasts', getBroadcasts);
router.post('/broadcasts', sendBroadcast);

export default router;
