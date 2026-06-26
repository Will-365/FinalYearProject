import express from 'express';
import {
  getAddressNodes,
  getAddressTree,
  createAddressNode,
  updateAddressNode,
  deleteAddressNode,
  assignCollectorToZone,
} from '../../controllers/admin/adminAddressController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/tree', getAddressTree);
router.get('/', getAddressNodes);
router.post('/', createAddressNode);
router.put('/:id', updateAddressNode);
router.delete('/:id', deleteAddressNode);
router.patch('/:id/assign-collector', assignCollectorToZone);

export default router;
