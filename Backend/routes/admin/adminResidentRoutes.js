import express from 'express';
import {
  getAllResidents,
  getResidentById,
  deleteResident,
} from '../../controllers/admin/adminResidentController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getAllResidents);
router.get('/:id', getResidentById);
router.delete('/:id', deleteResident);

export default router;
