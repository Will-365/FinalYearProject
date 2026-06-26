import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import PointsLedger from '../models/PointsLedger.js';
import { createNotification } from '../utils/notificationService.js';

// GET /api/products — show all active products (including out-of-stock with badge)
export const getProducts = async (req, res, next) => {
  try {
    // Only products created from collected waste appear in the eco shop
    const products = await Product.find({
      isActive: true,
      $or: [{ wasteIntake: { $ne: null } }, { collectionRequest: { $ne: null } }],
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { products } });
  } catch (error) {
    next(error);
  }
};

// POST /api/products/:id/buy
export const buyProduct = async (req, res, next) => {
  try {
    const { paymentMethod, quantity = 1, deliveryNote } = req.body;
    const allowed = ['points', 'phone', 'cash'];
    if (!allowed.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'paymentMethod must be points, phone, or cash' });
    }

    const product = await Product.findById(req.params.id);
    const user = await User.findById(req.user.id);
    const qty = Math.max(1, parseInt(quantity));

    if (!product || !product.isActive || product.stock < qty) {
      return res.status(400).json({ success: false, message: 'Product unavailable or insufficient stock' });
    }
    const pointsNeeded = product.pointsCost * qty;
    const cashAmount = (paymentMethod === 'phone' ? product.phonePrice : product.cashPrice) * qty;

    if (paymentMethod === 'points') {
      if (user.points < pointsNeeded) {
        return res.status(400).json({ success: false, message: 'Insufficient points' });
      }
      user.points -= pointsNeeded;
      await user.save();
      await PointsLedger.create({
        user: user._id,
        points: -pointsNeeded,
        type: 'spent',
        source: 'product_purchase',
        description: `Purchased ${product.name} x${qty}`,
      });
    }

    product.stock -= qty;
    await product.save();

    const order = await Order.create({
      user: req.user.id,
      product: product._id,
      quantity: qty,
      paymentMethod,
      pointsUsed: paymentMethod === 'points' ? pointsNeeded : 0,
      cashAmount: paymentMethod !== 'points' ? cashAmount : 0,
      status: paymentMethod === 'points' ? 'confirmed' : 'pending',
      deliveryNote: deliveryNote || '',
    });

    await createNotification({
      userId: user._id,
      type: 'system',
      title: 'Order placed',
      message: `Your order for ${product.name} is ${order.status}.`,
      relatedId: order._id,
      relatedModel: 'Order',
    });

    const populated = await Order.findById(order._id).populate('product', 'name pointsCost cashPrice category');
    res.status(201).json({
      success: true,
      message: paymentMethod === 'points' ? 'Product purchased with points' : 'Order placed — pay on delivery',
      data: { order: populated, remainingPoints: user.points },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/my-orders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('product', 'name category pointsCost cashPrice phonePrice imageUrl')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
};
