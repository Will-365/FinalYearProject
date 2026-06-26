import express from 'express';
import { getResidentReport } from '../controllers/reportsController.js';
import { getEnvironmentalImpact } from '../controllers/environmentalController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/resident', authorize('resident'), getResidentReport);
router.get('/environmental-impact', authorize('resident'), getEnvironmentalImpact);

export default router;
