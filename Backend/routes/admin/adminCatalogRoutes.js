import express from 'express';
import {
  getAllProducts, getProductById, createProduct, updateProduct,
  adjustStock, deleteProduct,
  getAllOrders, updateOrderStatus,
  getAllBuyers, toggleBuyer,
} from '../../controllers/admin/adminProductController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorize('admin'));

// Products
router.get('/products',              getAllProducts);
router.post('/products',             createProduct);
router.get('/products/:id',          getProductById);
router.put('/products/:id',          updateProduct);
router.patch('/products/:id/stock',  adjustStock);
router.delete('/products/:id',       deleteProduct);

// Orders
router.get('/orders',              getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Buyers
router.get('/buyers',              getAllBuyers);
router.patch('/buyers/:id/toggle', toggleBuyer);

export default router;
