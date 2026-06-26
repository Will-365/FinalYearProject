import express from 'express';
import RecyclingCenter from '../../models/RecyclingCenter.js';
import {
  getAllProducts,
  getProductById,
  createProduct,
  createProductFromWaste,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
} from '../../controllers/admin/adminProductController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.use(authorize('admin'));

// Recycling centers CRUD
router.get('/centers', async (req, res, next) => {
  try {
    const centers = await RecyclingCenter.find().sort({ district: 1, name: 1 });
    res.json({ success: true, data: { centers } });
  } catch (e) { next(e); }
});

router.post('/centers', async (req, res, next) => {
  try {
    const center = await RecyclingCenter.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: center });
  } catch (e) { next(e); }
});

router.put('/centers/:id', async (req, res, next) => {
  try {
    const center = await RecyclingCenter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!center) return res.status(404).json({ success: false, message: 'Center not found' });
    res.json({ success: true, data: center });
  } catch (e) { next(e); }
});

// Products
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.post('/products/from-waste/:intakeId', createProductFromWaste);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;
