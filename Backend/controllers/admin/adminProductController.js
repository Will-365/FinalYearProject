import Product from '../../models/Product.js';
import WasteCategoryIntake from '../../models/WasteCategoryIntake.js';
import Order from '../../models/Order.js';
import Buyer from '../../models/Buyer.js';
import { createNotification } from '../../utils/notificationService.js';

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/catalog/products
export const getAllProducts = async (req, res, next) => {
  try {
    const { category, isActive, wasteType, inStock, page = 1, limit = 50, search } = req.query;

    const filter = {};
    if (category)              filter.category  = category;
    if (wasteType)             filter.wasteType = wasteType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (inStock === 'true')    filter.stock = { $gt: 0 };
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('wasteIntake',       'wasteType weightKg intakeDate processingStatus')
        .populate('collectionRequest', 'wasteType quantity status')
        .populate('createdBy', 'fullName')
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    // Low-stock alerts
    const lowStockItems = products
      .filter(p => p.isActive && p.stock > 0 && p.stock <= p.lowStockThreshold)
      .map(p => ({ id: p._id, name: p.name, stock: p.stock }));

    res.status(200).json({
      success: true,
      data: {
        products,
        lowStockAlerts: lowStockItems,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) { next(error); }
};

// GET /api/admin/catalog/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('wasteIntake', 'wasteType weightKg intakeDate processingStatus processingHistory location')
      .populate('collectionRequest', 'wasteType quantity status location')
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Order stats
    const orderStats = await Order.aggregate([
      { $match: { product: product._id, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$status', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
    ]);

    res.status(200).json({ success: true, data: { product, orderStats } });
  } catch (error) { next(error); }
};

// POST /api/admin/catalog/products  — create product manually (not from waste pipeline)
export const createProduct = async (req, res, next) => {
  try {
    const {
      name, description, category, wasteType, pointsCost, cashPrice, phonePrice,
      stock, imageUrl, images, thumbnailUrl, partner, sku, unit, tags,
      sourceWeightKg, wasteIntakeId, collectionRequestId, isActive, isFeatured, isPublic,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    if (!imageUrl && !images?.length) {
      return res.status(400).json({ success: false, message: 'At least one product image is required' });
    }

    const primaryImage = imageUrl?.trim() || images?.[0] || '';

    const product = await Product.create({
      name:        name.trim(),
      description: description || '',
      category:    category || 'recycled_goods',
      wasteType:   wasteType || 'recyclable',
      pointsCost:  Number(pointsCost || 0),
      cashPrice:   Number(cashPrice  || 0),
      phonePrice:  Number(phonePrice || cashPrice || 0),
      stock:       Number(stock || 0),
      imageUrl:    primaryImage,
      images:      images?.length ? images : (primaryImage ? [primaryImage] : []),
      thumbnailUrl:thumbnailUrl?.trim() || primaryImage,
      partner:     partner || 'GreenCare Rwanda',
      sku:         sku || `GC-${Date.now()}`,
      unit:        unit || 'piece',
      tags:        tags || [],
      sourceWeightKg: parseFloat(sourceWeightKg || 0),
      wasteIntake: wasteIntakeId || null,
      collectionRequest: collectionRequestId || null,
      isActive:    isActive !== false,
      isFeatured:  !!isFeatured,
      isPublic:    isPublic !== false,
      createdBy:   req.user.id,
    });

    res.status(201).json({ success: true, message: `Product "${product.name}" created`, data: product });
  } catch (error) { next(error); }
};

// PUT /api/admin/catalog/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const allowed = [
      'name','description','category','wasteType','pointsCost','cashPrice','phonePrice',
      'stock','imageUrl','images','thumbnailUrl','partner','sku','unit','isActive',
      'isFeatured','isPublic','sourceWeightKg','tags','lowStockThreshold',
    ];
    const updates = { updatedBy: req.user.id };
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    // Ensure imageUrl stays consistent with images array
    if (updates.imageUrl && updates.images) {
      if (!updates.images.includes(updates.imageUrl)) {
        updates.images = [updates.imageUrl, ...updates.images];
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product updated', data: product });
  } catch (error) { next(error); }
};

// PATCH /api/admin/catalog/products/:id/stock
export const adjustStock = async (req, res, next) => {
  try {
    const { adjustment, reason } = req.body;
    const delta = parseInt(adjustment);
    if (isNaN(delta)) return res.status(400).json({ success: false, message: 'adjustment must be a number (+ to add, - to remove)' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const newStock = product.stock + delta;
    if (newStock < 0) return res.status(400).json({ success: false, message: `Cannot reduce stock below 0. Current: ${product.stock}` });

    product.stock     = newStock;
    product.updatedBy = req.user.id;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Stock adjusted by ${delta >= 0 ? '+' : ''}${delta}. New stock: ${newStock}`,
      data: { stock: newStock, adjustment: delta, reason: reason || '' },
    });
  } catch (error) { next(error); }
};

// DELETE /api/admin/catalog/products/:id  (soft)
export const deleteProduct = async (req, res, next) => {
  try {
    const activeOrders = await Order.countDocuments({
      product: req.params.id,
      status:  { $in: ['pending', 'confirmed', 'processing'] },
    });
    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — ${activeOrders} active order(s). Deactivate instead.`,
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, isPublic: false, updatedBy: req.user.id },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product deactivated', data: product });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS (Admin view)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/catalog/orders
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentMethod, page = 1, limit = 20, search, dateFrom, dateTo } = req.query;
    const filter = {};
    if (status)        filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo)   filter.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search by buyer name or phone across both user and guest fields
    if (search) {
      filter.$or = [
        { buyerName:  new RegExp(search, 'i') },
        { buyerPhone: new RegExp(search, 'i') },
      ];
    }

    const [orders, total, statusSummary] = await Promise.all([
      Order.find(filter)
        .populate('user',    'fullName email phone location')
        .populate('product', 'name imageUrl cashPrice phonePrice pointsCost category unit')
        .populate('processedBy', 'fullName')
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Order.countDocuments(filter),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$cashAmount' } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        statusSummary,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) { next(error); }
};

// PATCH /api/admin/catalog/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNote, cancelReason } = req.body;
    const allowed = ['pending','confirmed','processing','ready','fulfilled','cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const order = await Order.findById(req.params.id).populate('user', '_id');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status === 'cancelled' && order.status !== 'cancelled') {
      // Restore stock
      await Product.findByIdAndUpdate(order.product, { $inc: { stock: order.quantity, totalSold: -order.quantity } });
      // Refund points
      if (order.paymentMethod === 'points' && order.pointsUsed > 0 && order.user?._id) {
        const User = (await import('../../models/User.js')).default;
        await User.findByIdAndUpdate(order.user._id, { $inc: { points: order.pointsUsed } });
      }
      order.cancelReason = cancelReason || 'Cancelled by admin';
    }

    if (status === 'confirmed') order.confirmedAt = new Date();
    if (status === 'fulfilled') {
      order.fulfilledAt = new Date();
      await Product.findByIdAndUpdate(order.product, { $inc: { totalSold: 0 } }); // already counted on purchase
    }

    order.status      = status;
    order.processedBy = req.user.id;
    if (trackingNote) order.trackingNote = trackingNote;
    await order.save();

    // Notify registered resident
    if (order.user?._id) {
      const msgs = {
        confirmed:  'Your order has been confirmed and is being prepared.',
        processing: 'Your order is being processed.',
        ready:      'Your order is ready for pickup/delivery!',
        fulfilled:  'Your order has been delivered. Thank you! 🌿',
        cancelled:  `Your order was cancelled. ${cancelReason || ''}`,
      };
      if (msgs[status]) {
        await createNotification({
          userId: order.user._id,
          type:   'system',
          title:  `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: msgs[status],
          relatedId: order._id, relatedModel: 'Order',
        });
      }
    }

    const populated = await Order.findById(order._id)
      .populate('user', 'fullName email phone')
      .populate('product', 'name imageUrl');

    res.status(200).json({ success: true, message: `Order updated to "${status}"`, data: populated });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// BUYERS (Admin management)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/catalog/buyers
export const getAllBuyers = async (req, res, next) => {
  try {
    const { search, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, 'i') },
        { phone:    new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [buyers, total] = await Promise.all([
      Buyer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Buyer.countDocuments(filter),
    ]);

    // Attach order count per buyer
    const enriched = await Promise.all(
      buyers.map(async b => {
        const orderCount = await Order.countDocuments({ buyerPhone: b.phone });
        return { ...b.toObject(), orderCount };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        buyers: enriched,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) { next(error); }
};

// PATCH /api/admin/catalog/buyers/:id/toggle
export const toggleBuyer = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) return res.status(404).json({ success: false, message: 'Buyer not found' });
    buyer.isActive = !buyer.isActive;
    await buyer.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: `Buyer account ${buyer.isActive ? 'activated' : 'deactivated'}`,
      data: { isActive: buyer.isActive },
    });
  } catch (error) { next(error); }
};
