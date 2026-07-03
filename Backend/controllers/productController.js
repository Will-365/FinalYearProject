import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Buyer from '../models/Buyer.js';
import PointsLedger from '../models/PointsLedger.js';
import { createNotification } from '../utils/notificationService.js';

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — Browse products (no auth required)
// GET /api/products
// ─────────────────────────────────────────────────────────────────────────────
export const getProducts = async (req, res, next) => {
  try {
    const {
      category, wasteType, minPrice, maxPrice, minPoints, maxPoints,
      search, featured, inStock, page = 1, limit = 20,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const filter = { isActive: true, isPublic: true };
    if (inStock === 'true' || !inStock) filter.stock = { $gt: 0 };  // default: only in-stock
    if (inStock === 'all') delete filter.stock;                      // admin view
    if (category)         filter.category  = category;
    if (wasteType)        filter.wasteType = wasteType;
    if (featured === 'true') filter.isFeatured = true;
    if (minPrice || maxPrice) {
      filter.cashPrice = {};
      if (minPrice) filter.cashPrice.$gte = Number(minPrice);
      if (maxPrice) filter.cashPrice.$lte = Number(maxPrice);
    }
    if (minPoints || maxPoints) {
      filter.pointsCost = {};
      if (minPoints) filter.pointsCost.$gte = Number(minPoints);
      if (maxPoints) filter.pointsCost.$lte = Number(maxPoints);
    }
    if (search) {
      filter.$or = [
        { name:        new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags:        new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort).skip(skip).limit(parseInt(limit))
        .select('-wasteIntake -collectionRequest -createdBy -updatedBy -isPublic'),
      Product.countDocuments(filter),
    ]);

    // If the caller is an authenticated resident, attach their points balance
    let userPoints = null;
    if (req.user?.role === 'resident') {
      const u = await User.findById(req.user.id).select('points');
      userPoints = u?.points ?? 0;
    }

    res.status(200).json({
      success: true,
      data: {
        products,
        userPoints,
        pagination: {
          page: parseInt(page), limit: parseInt(limit),
          total, pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — Single product detail
// GET /api/products/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true, isPublic: true })
      .select('-createdBy -updatedBy');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let userPoints = null;
    if (req.user?.role === 'resident') {
      const u = await User.findById(req.user.id).select('points');
      userPoints = u?.points ?? 0;
    }

    res.status(200).json({ success: true, data: { product, userPoints } });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE — Place order (resident uses points/cash, buyer uses cash/mobile money)
// POST /api/products/:id/buy
// ─────────────────────────────────────────────────────────────────────────────
export const buyProduct = async (req, res, next) => {
  try {
    const { paymentMethod, quantity = 1, pointsToUse = 0, deliveryNote, mobileMoneyPhone, deliveryAddress } = req.body;
    const allowed = ['points', 'mobile_money', 'cash', 'split'];

    if (!allowed.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'paymentMethod must be points, mobile_money, cash, or split' });
    }

    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive || !product.isPublic) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    const qty = Math.max(1, parseInt(quantity));
    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${qty}`,
      });
    }

    // ── Buyer validation ─────────────────────────────────────
    const isBuyer    = req.user?.role === 'buyer';
    const isResident = req.user?.role === 'resident';

    if ((paymentMethod === 'points' || paymentMethod === 'split') && !isResident) {
      return res.status(403).json({ success: false, message: 'Only residents can use points' });
    }
    if ((paymentMethod === 'mobile_money' || paymentMethod === 'split') && !mobileMoneyPhone && paymentMethod !== 'split') {
       // Note: if split and they want to pay remainder in cash, we don't strictly need mobileMoneyPhone. We'll check later if needed.
    }

    // ── Points deduction (resident only) ─────────────────────
    let pointsUsed = 0;
    let cashAmount = 0;
    let residualPoints = null;

    if (paymentMethod === 'points' || paymentMethod === 'split') {
      const user = await User.findById(req.user.id);
      const maxPointsNeeded = product.pointsCost * qty;
      
      const needed = paymentMethod === 'split' ? Math.min(parseInt(pointsToUse) || 0, maxPointsNeeded, user.points) : maxPointsNeeded;
      
      if (paymentMethod === 'points' && user.points < needed) {
        return res.status(400).json({
          success: false,
          message: `Insufficient points. Need ${needed}, you have ${user.points}`,
        });
      }
      
      if (needed > 0) {
        user.points -= needed;
        await user.save();
        await PointsLedger.create({
          user:        user._id,
          points:      -needed,
          type:        'spent',
          source:      'product_purchase',
          description: `Used points for "${product.name}" x${qty}`,
        });
        pointsUsed    = needed;
        residualPoints = user.points;
      }
      
      if (paymentMethod === 'split') {
        const remainingRatio = 1 - (pointsUsed / maxPointsNeeded);
        cashAmount = Math.ceil(product.cashPrice * qty * remainingRatio);
      }
    } else {
      cashAmount = (paymentMethod === 'mobile_money' ? product.phonePrice : product.cashPrice) * qty || product.cashPrice * qty;
    }

    // ── Reduce stock ─────────────────────────────────────────
    product.stock     -= qty;
    product.totalSold  = (product.totalSold || 0) + qty;
    await product.save();

    // ── Create order ──────────────────────────────────────────
    const orderData = {
      product:          product._id,
      quantity:         qty,
      paymentMethod,
      pointsUsed,
      cashAmount,
      mobileMoneyPhone: mobileMoneyPhone || '',
      status:           paymentMethod === 'points' ? 'confirmed' : 'pending',
      deliveryNote:     deliveryNote || '',
      deliveryAddress:  deliveryAddress || {},
    };

    if (isResident || (req.user && !isBuyer)) {
      orderData.user = req.user.id;
    } else if (isBuyer) {
      const buyer = await Buyer.findById(req.user.id);
      orderData.user       = null;
      orderData.buyerPhone = buyer?.phone || '';
      orderData.buyerName  = buyer?.fullName || '';
    } else {
      // Unauthenticated — require name + phone in body
      const { buyerName, buyerPhone } = req.body;
      if (!buyerName?.trim() || !buyerPhone?.trim()) {
        return res.status(400).json({ success: false, message: 'buyerName and buyerPhone are required for guest orders' });
      }
      orderData.buyerPhone = buyerPhone.trim();
      orderData.buyerName  = buyerName.trim();
    }

    const order = await Order.create(orderData);

    // ── Notify resident ───────────────────────────────────────
    if (isResident) {
      await createNotification({
        userId: req.user.id,
        type: 'system',
        title: 'Order placed',
        message: paymentMethod === 'points'
          ? `Your order for "${product.name}" was confirmed using ${pointsUsed} points.`
          : `Your order for "${product.name}" is pending. Total: ${cashAmount} RWF.`,
        relatedId:    order._id,
        relatedModel: 'Order',
      });
    }

    const populated = await Order.findById(order._id)
      .populate('product', 'name imageUrl cashPrice phonePrice pointsCost category unit');

    res.status(201).json({
      success: true,
      message: paymentMethod === 'points'
        ? `Order confirmed — ${pointsUsed} points used`
        : `Order placed — pay ${cashAmount} RWF on ${paymentMethod === 'mobile_money' ? 'mobile money' : 'delivery'}`,
      data: {
        order: populated,
        ...(residualPoints !== null ? { remainingPoints: residualPoints } : {}),
      },
    });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE (resident or buyer) — My orders
// GET /api/products/orders/mine
// ─────────────────────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    if (req.user.role === 'buyer') {
      // Buyer orders matched by their phone
      const buyer = await Buyer.findById(req.user.id).select('phone');
      if (!buyer) return res.status(404).json({ success: false, message: 'Buyer not found' });
      filter = { buyerPhone: buyer.phone };
    } else {
      filter = { user: req.user.id };
    }

    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('product', 'name imageUrl category unit cashPrice pointsCost')
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE — Cancel an order
// PATCH /api/products/orders/:id/cancel
// ─────────────────────────────────────────────────────────────────────────────
export const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Ownership check
    const owned = (order.user && String(order.user) === req.user.id) ||
      (order.buyerPhone && req.user.role === 'buyer');
    if (!owned) return res.status(403).json({ success: false, message: 'Access denied' });

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending orders can be cancelled. Current status: ${order.status}`,
      });
    }

    // Restore stock
    await Product.findByIdAndUpdate(order.product, { $inc: { stock: order.quantity, totalSold: -order.quantity } });

    // Refund points
    if (order.paymentMethod === 'points' && order.pointsUsed > 0 && order.user) {
      await User.findByIdAndUpdate(order.user, { $inc: { points: order.pointsUsed } });
      await PointsLedger.create({
        user:        order.user,
        points:      order.pointsUsed,
        type:        'earned',
        source:      'product_purchase',
        description: 'Points refunded for cancelled order',
      });
    }

    order.status       = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order cancelled${order.paymentMethod === 'points' ? ` — ${order.pointsUsed} pts refunded` : ''}`,
      data: order,
    });
  } catch (error) { next(error); }
};
