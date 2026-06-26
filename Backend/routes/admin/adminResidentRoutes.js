import express from 'express';
import { getAllResidents, getResidentById } from '../../controllers/admin/adminResidentController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getAllResidents);
router.get('/:id', getResidentById);

export default router;
