import express from 'express';
import {
  getProducts, getProductById, buyProduct, getMyOrders, cancelMyOrder,
} from '../controllers/productController.js';
import { protect, optionalAuth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Fully public (no auth required) ──────────────────────────
// GET  /api/products          — browse all in-stock public products
// GET  /api/products/:id      — single product detail
router.get('/',    optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProductById);

// ── Buy — open to residents, buyers, even guests (name+phone in body) ────────
// POST /api/products/:id/buy
router.post('/:id/buy', optionalAuth, buyProduct);

// ── Authenticated: resident OR buyer can view their own orders ────────────────
// GET   /api/products/orders/mine
// PATCH /api/products/orders/:id/cancel
router.get('/orders/mine',          protect, authorize('resident', 'buyer'), getMyOrders);
router.patch('/orders/:id/cancel',  protect, authorize('resident', 'buyer'), cancelMyOrder);

export default router;
