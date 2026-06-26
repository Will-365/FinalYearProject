import express from 'express';
import { getProducts, buyProduct, getMyOrders } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('resident'));

router.get('/', getProducts);
router.get('/orders/mine', getMyOrders);
router.post('/:id/buy', buyProduct);

export default router;
