import Product from '../../models/Product.js';
import WasteCategoryIntake from '../../models/WasteCategoryIntake.js';
import Order from '../../models/Order.js';
import { createNotification } from '../../utils/notificationService.js';

const DEFAULT_IMAGES = {
  compost: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
  pavers: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
  recycled_goods: 'https://images.unsplash.com/photo-1532996122724-e3c354a0a15b?w=400',
  eco_product: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
};

// GET /api/admin/catalog/products
export const getAllProducts = async (req, res, next) => {
  try {
    const { category, isActive, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('wasteIntake', 'wasteType weightKg intakeDate')
        .populate('collectionRequest', 'wasteType quantity status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { products, pagination: { page: parseInt(page), limit: parseInt(limit), total } },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/catalog/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('wasteIntake')
      .populate('collectionRequest');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/catalog/products
export const createProduct = async (req, res, next) => {
  try {
    const {
      name, description, category, wasteType, pointsCost, cashPrice, phonePrice,
      stock, imageUrl, images, partner, sku, unit, sourceWeightKg,
      wasteIntakeId, collectionRequestId, isActive,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description || '',
      category: category || 'recycled_goods',
      wasteType: wasteType || 'recyclable',
      pointsCost: parseInt(pointsCost) || 0,
      cashPrice: parseInt(cashPrice) || 0,
      phonePrice: parseInt(phonePrice) || parseInt(cashPrice) || 0,
      stock: parseInt(stock) || 0,
      imageUrl: imageUrl || images?.[0] || DEFAULT_IMAGES[category] || DEFAULT_IMAGES.recycled_goods,
      images: images?.length ? images : imageUrl ? [imageUrl] : [],
      partner: partner || 'GreenCare Rwanda',
      sku: sku || `GC-${Date.now()}`,
      unit: unit || 'piece',
      sourceWeightKg: parseFloat(sourceWeightKg) || 0,
      wasteIntake: wasteIntakeId || null,
      collectionRequest: collectionRequestId || null,
      isActive: isActive !== false,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/catalog/products/from-waste/:intakeId
// Convert processed waste intake into a sellable product
export const createProductFromWaste = async (req, res, next) => {
  try {
    const intake = await WasteCategoryIntake.findById(req.params.intakeId);
    if (!intake) {
      return res.status(404).json({ success: false, message: 'Waste intake record not found' });
    }
    if (intake.product) {
      return res.status(400).json({ success: false, message: 'This waste batch was already converted to a product' });
    }

    const {
      name, description, category, pointsCost, cashPrice, phonePrice,
      stock, imageUrl, images, unit,
    } = req.body;

    const wasteLabel = intake.wasteType.charAt(0).toUpperCase() + intake.wasteType.slice(1);
    const defaultName = name || `Recycled ${wasteLabel} Product (${intake.weightKg}kg batch)`;
    const defaultCategory = intake.wasteType === 'organic' ? 'compost' : 'recycled_goods';
    const qty = parseInt(stock) || Math.max(1, Math.floor(intake.weightKg));

    const product = await Product.create({
      name: defaultName,
      description: description || `Made from ${intake.weightKg}kg of collected ${intake.wasteType} waste in Rwanda.`,
      category: category || defaultCategory,
      wasteType: intake.wasteType,
      pointsCost: parseInt(pointsCost) || Math.round(intake.weightKg * 10),
      cashPrice: parseInt(cashPrice) || Math.round(intake.weightKg * 500),
      phonePrice: parseInt(phonePrice) || Math.round(intake.weightKg * 500),
      stock: qty,
      imageUrl: imageUrl || images?.[0] || DEFAULT_IMAGES[defaultCategory] || DEFAULT_IMAGES.recycled_goods,
      images: images?.length ? images : [],
      sourceWeightKg: intake.weightKg,
      wasteIntake: intake._id,
      collectionRequest: intake.collectionRequest || null,
      unit: unit || 'piece',
      createdBy: req.user.id,
    });

    intake.processingStatus = 'converted';
    intake.product = product._id;
    intake.convertedAt = new Date();
    await intake.save();

    // Notify all residents about new eco product
    const User = (await import('../../models/User.js')).default;
    const residents = await User.find({ role: 'resident', isVerified: true, isActive: true }).select('_id').limit(200);
    await Promise.all(
      residents.slice(0, 50).map((r) =>
        createNotification({
          userId: r._id,
          type: 'system',
          title: 'New eco product available',
          message: `${product.name} is now in the Eco Shop — ${product.cashPrice} RWF or ${product.pointsCost} points`,
          relatedId: product._id,
          relatedModel: 'Product',
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `Waste converted to product "${product.name}" with ${qty} units in stock`,
      data: { product, intake },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/catalog/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const allowed = [
      'name', 'description', 'category', 'wasteType', 'pointsCost', 'cashPrice', 'phonePrice',
      'stock', 'imageUrl', 'images', 'partner', 'sku', 'unit', 'isActive', 'sourceWeightKg',
    ];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/catalog/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false, stock: 0 }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product deactivated', data: product });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/catalog/orders
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'fullName email phone')
        .populate('product', 'name imageUrl cashPrice phonePrice pointsCost')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, data: { orders, pagination: { page: parseInt(page), total } } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/catalog/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'fulfilled', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('user', 'fullName email phone')
      .populate('product', 'name');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await createNotification({
      userId: order.user._id || order.user,
      type: 'system',
      title: 'Order update',
      message: `Your order for ${order.product?.name || 'product'} is now ${status}`,
      relatedId: order._id,
      relatedModel: 'Order',
    });

    res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    next(error);
  }
};
