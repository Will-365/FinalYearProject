import express from 'express';
import {
  getWasteIntakeLog,
  getWasteIntakeAnalytics,
  getDiscrepancies,
  logWasteIntake,
  advancePipelineStage,
  convertToProduct,
  resolveDiscrepancy,
} from '../../controllers/admin/adminWasteIntakeController.js';
import { getTurningAdvisory } from '../../controllers/admin/weatherController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorize('admin'));

// Analytics & summaries
router.get('/analytics',     getWasteIntakeAnalytics);
router.get('/turning-advisory', getTurningAdvisory);
router.get('/discrepancies', getDiscrepancies);

// CRUD
router.get('/',  getWasteIntakeLog);
router.post('/', logWasteIntake);

// Pipeline management
router.patch('/:id/stage',              advancePipelineStage);   // move to next stage
router.post('/:id/convert-to-product',  convertToProduct);       // packaging → product (upload image etc.)

// Discrepancy resolution
router.patch('/:id/resolve-discrepancy', resolveDiscrepancy);

export default router;
