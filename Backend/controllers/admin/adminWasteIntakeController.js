import WasteCategoryIntake from '../../models/WasteCategoryIntake.js';
import CollectionRequest from '../../models/CollectionRequest.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';
import { createNotification } from '../../utils/notificationService.js';
import { awardPoints } from '../../utils/pointsService.js';

/**
 * Pipeline stages (in order):
 *   received → sorting → curing → forming → packaging → product
 */
const PIPELINE_ORDER = ['received', 'sorting', 'curing', 'forming', 'packaging', 'product'];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/waste-intake
// ─────────────────────────────────────────────────────────────────────────────
export const getWasteIntakeLog = async (req, res, next) => {
  try {
    const {
      wasteType, district, processingStatus,
      hasDiscrepancy, dateFrom, dateTo,
      page = 1, limit = 20,
    } = req.query;

    const filter = {};
    if (wasteType)         filter.wasteType = wasteType;
    if (processingStatus)  filter.processingStatus = processingStatus;
    if (district)          filter['location.district'] = new RegExp(district, 'i');
    if (hasDiscrepancy !== undefined) filter.hasDiscrepancy = hasDiscrepancy === 'true';
    if (dateFrom || dateTo) {
      filter.intakeDate = {};
      if (dateFrom) filter.intakeDate.$gte = new Date(dateFrom);
      if (dateTo)   filter.intakeDate.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      WasteCategoryIntake.find(filter)
        .sort({ intakeDate: -1 }).skip(skip).limit(parseInt(limit))
        .populate('recordedBy',       'fullName role')
        .populate('collectionRequest','wasteType quantity status resident')
        .populate('product',          'name imageUrl cashPrice stock')
        .populate('resolvedBy',       'fullName')
        .populate('convertedBy',      'fullName'),
      WasteCategoryIntake.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        records,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/waste-intake/analytics
// ─────────────────────────────────────────────────────────────────────────────
export const getWasteIntakeAnalytics = async (req, res, next) => {
  try {
    const { period = '30d', district } = req.query;
    const dayMap = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
    const days   = dayMap[period] || 30;
    const since  = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const matchFilter = { intakeDate: { $gte: since } };
    if (district) matchFilter['location.district'] = new RegExp(district, 'i');

    const [byCategory, byDistrict, trend, totals, pipelineStages, discrepancies] = await Promise.all([
      WasteCategoryIntake.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$wasteType', totalWeightKg: { $sum: '$weightKg' }, count: { $sum: 1 }, avgWeight: { $avg: '$weightKg' } } },
        { $sort: { totalWeightKg: -1 } },
      ]),
      WasteCategoryIntake.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$location.district', totalWeightKg: { $sum: '$weightKg' }, count: { $sum: 1 } } },
        { $sort: { totalWeightKg: -1 } }, { $limit: 10 },
      ]),
      WasteCategoryIntake.aggregate([
        { $match: matchFilter },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$intakeDate' } }, totalWeightKg: { $sum: '$weightKg' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      WasteCategoryIntake.aggregate([
        { $match: matchFilter },
        { $group: { _id: null, totalWeightKg: { $sum: '$weightKg' }, totalRecords: { $sum: 1 } } },
      ]),
      WasteCategoryIntake.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$processingStatus', count: { $sum: 1 }, totalKg: { $sum: '$weightKg' } } },
      ]),
      WasteCategoryIntake.countDocuments({ hasDiscrepancy: true, discrepancyResolved: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        totals: totals[0] || { totalWeightKg: 0, totalRecords: 0 },
        byCategory, byDistrict, trend, pipelineStages,
        pendingDiscrepancies: discrepancies,
      },
    });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/waste-intake/discrepancies
// All unresolved discrepancies for admin review
// ─────────────────────────────────────────────────────────────────────────────
export const getDiscrepancies = async (req, res, next) => {
  try {
    const { resolved, page = 1, limit = 20 } = req.query;
    const filter = { hasDiscrepancy: true };
    if (resolved !== undefined) filter.discrepancyResolved = resolved === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [records, total] = await Promise.all([
      WasteCategoryIntake.find(filter)
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
        .populate('collectionRequest', 'wasteType quantity preferredDate location resident')
        .populate({
          path: 'collectionRequest',
          populate: { path: 'resident', select: 'fullName phone points' },
        })
        .populate('recordedBy', 'fullName vehicleType')
        .populate('resolvedBy', 'fullName'),
      WasteCategoryIntake.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { records, pagination: { page: parseInt(page), limit: parseInt(limit), total } },
    });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/waste-intake
// Manually log waste intake
// ─────────────────────────────────────────────────────────────────────────────
export const logWasteIntake = async (req, res, next) => {
  try {
    const {
      wasteType, weightKg, volumeLiters, location,
      intakeDate, collectionRequestId, processingStatus, notes,
    } = req.body;

    if (!wasteType || weightKg === undefined) {
      return res.status(400).json({ success: false, message: 'wasteType and weightKg are required' });
    }

    const record = await WasteCategoryIntake.create({
      recordedBy:        req.user.id,
      wasteType,
      weightKg:          parseFloat(weightKg),
      volumeLiters:      volumeLiters ? parseFloat(volumeLiters) : null,
      location:          location || {},
      intakeDate:        intakeDate ? new Date(intakeDate) : new Date(),
      collectionRequest: collectionRequestId || null,
      processingStatus:  processingStatus || 'received',
      notes:             notes || '',
      processingHistory: [{
        stage:     processingStatus || 'received',
        updatedBy: req.user.id,
        note:      'Manually logged by admin',
        timestamp: new Date(),
      }],
    });

    res.status(201).json({ success: true, message: 'Waste intake recorded', data: record });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/waste-intake/:id/stage
// Advance through the processing pipeline:
//   received → sorting → curing → forming → packaging → product
// ─────────────────────────────────────────────────────────────────────────────
export const advancePipelineStage = async (req, res, next) => {
  try {
    const { stage, note } = req.body;

    if (!stage || !PIPELINE_ORDER.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `stage must be one of: ${PIPELINE_ORDER.join(' → ')}`,
      });
    }

    const record = await WasteCategoryIntake.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Intake record not found' });

    const currentIdx = PIPELINE_ORDER.indexOf(record.processingStatus);
    const newIdx     = PIPELINE_ORDER.indexOf(stage);

    if (newIdx < currentIdx) {
      return res.status(400).json({
        success: false,
        message: `Cannot move backwards in the pipeline. Current stage: ${record.processingStatus}`,
      });
    }

    record.processingStatus = stage;
    record.processingHistory.push({
      stage,
      updatedBy: req.user.id,
      note:      note || '',
      timestamp: new Date(),
    });

    await record.save();

    const populated = await WasteCategoryIntake.findById(record._id)
      .populate('collectionRequest', 'wasteType quantity')
      .populate('recordedBy', 'fullName');

    res.status(200).json({
      success: true,
      message: `Waste batch advanced to "${stage}" stage`,
      data: populated,
      nextStage: PIPELINE_ORDER[newIdx + 1] || null,
    });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/waste-intake/:id/convert-to-product
// The final step: packaging → product
// Upload product image, set name, quantity, unit cost → creates a Product record
// ─────────────────────────────────────────────────────────────────────────────
export const convertToProduct = async (req, res, next) => {
  try {
    const intake = await WasteCategoryIntake.findById(req.params.id)
      .populate('collectionRequest', 'wasteType quantity');

    if (!intake) return res.status(404).json({ success: false, message: 'Intake record not found' });

    if (intake.convertedToProduct) {
      return res.status(400).json({
        success: false,
        message: 'This waste batch has already been converted to a product',
        existingProductId: intake.product,
      });
    }

    if (intake.processingStatus !== 'packaging' && intake.processingStatus !== 'product') {
      return res.status(400).json({
        success: false,
        message: `Waste must be at "packaging" stage before converting to a product. Current stage: ${intake.processingStatus}. Pipeline: ${PIPELINE_ORDER.join(' → ')}`,
      });
    }

    // ── Required product fields ───────────────────────────────
    const {
      name, description, category,
      pointsCost, cashPrice, phonePrice,
      stock, unit,
      imageUrl,   // primary image — base64 string OR URL
      images,     // additional images array
      thumbnailUrl,
      partner, tags, isFeatured,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    if (pointsCost === undefined || pointsCost === null) {
      return res.status(400).json({ success: false, message: 'pointsCost is required' });
    }
    if (!cashPrice && cashPrice !== 0) {
      return res.status(400).json({ success: false, message: 'cashPrice (in RWF) is required' });
    }
    if (!stock && stock !== 0) {
      return res.status(400).json({ success: false, message: 'stock (quantity available) is required' });
    }
    if (!imageUrl?.trim() && !(images?.length)) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image (imageUrl or images array) is required before publishing',
      });
    }

    // ── Derive defaults from the waste intake ─────────────────
    const defaultCategory = intake.wasteType === 'organic' ? 'compost'
      : intake.wasteType === 'recyclable' ? 'recycled_goods' : 'recycled_goods';

    const primaryImage = imageUrl?.trim() || images?.[0] || '';
    const allImages    = [];
    if (primaryImage) allImages.push(primaryImage);
    if (images?.length) {
      images.forEach(img => { if (img && !allImages.includes(img)) allImages.push(img); });
    }

    // ── Create the Product ────────────────────────────────────
    const product = await Product.create({
      name:            name.trim(),
      description:     description?.trim() || `Made from ${intake.weightKg}kg of ${intake.wasteType} waste collected in Rwanda.`,
      sku:             `GC-${intake.wasteType.toUpperCase().slice(0,3)}-${Date.now()}`,
      category:        category || defaultCategory,
      tags:            tags || [],
      wasteType:       intake.wasteType,
      sourceWeightKg:  intake.weightKg,
      wasteIntake:     intake._id,
      collectionRequest: intake.collectionRequest?._id || intake.collectionRequest || null,
      pipelineStage:   'product',
      pointsCost:      Number(pointsCost),
      cashPrice:       Number(cashPrice),
      phonePrice:      Number(phonePrice || cashPrice),
      currency:        'RWF',
      stock:           Number(stock),
      unit:            unit || 'piece',
      lowStockThreshold: 5,
      imageUrl:        primaryImage,
      images:          allImages,
      thumbnailUrl:    thumbnailUrl?.trim() || primaryImage,
      partner:         partner?.trim() || 'GreenCare Rwanda',
      isFeatured:      !!isFeatured,
      isActive:        true,
      isPublic:        true,
      createdBy:       req.user.id,
    });

    // ── Mark intake as fully converted ────────────────────────
    intake.processingStatus  = 'product';
    intake.convertedToProduct = true;
    intake.product           = product._id;
    intake.convertedAt       = new Date();
    intake.convertedBy       = req.user.id;
    intake.processingHistory.push({
      stage:     'product',
      updatedBy: req.user.id,
      note:      `Converted to product: "${product.name}" (${stock} units at ${cashPrice} RWF each)`,
      timestamp: new Date(),
    });
    await intake.save();

    // ── Notify residents about new eco product ─────────────────
    const residents = await User.find({ role: 'resident', isVerified: true, isActive: true }).select('_id').limit(100);
    if (residents.length) {
      await Promise.all(
        residents.map(r =>
          createNotification({
            userId:       r._id,
            type:         'system',
            title:        '🛒 New eco product available!',
            message:      `"${product.name}" is now in the Eco Shop — ${product.cashPrice} RWF or ${product.pointsCost} pts`,
            relatedId:    product._id,
            relatedModel: 'Product',
          })
        )
      );
    }

    const populated = await Product.findById(product._id).populate('wasteIntake', 'wasteType weightKg intakeDate');

    res.status(201).json({
      success: true,
      message: `✅ "${product.name}" created with ${stock} unit(s) — now visible in the shop`,
      data: {
        product: populated,
        intakeRecord: {
          id:              intake._id,
          wasteType:       intake.wasteType,
          weightKg:        intake.weightKg,
          processingStatus: intake.processingStatus,
        },
        pipelineSummary: {
          stages:     intake.processingHistory.map(h => ({ stage: h.stage, note: h.note, timestamp: h.timestamp })),
          totalStages: intake.processingHistory.length,
        },
      },
    });
  } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/waste-intake/:id/resolve-discrepancy
// Admin reviews collector's discrepancy note and decides on points
// ─────────────────────────────────────────────────────────────────────────────
export const resolveDiscrepancy = async (req, res, next) => {
  try {
    const { resolution, pointsOverride, adminNote } = req.body;

    const allowed = ['award_full', 'award_less', 'award_more', 'no_change'];
    if (!allowed.includes(resolution)) {
      return res.status(400).json({
        success: false,
        message: `resolution must be one of: ${allowed.join(', ')}`,
      });
    }

    const intake = await WasteCategoryIntake.findById(req.params.id)
      .populate({
        path: 'collectionRequest',
        populate: { path: 'resident', select: '_id fullName points' },
      });

    if (!intake) return res.status(404).json({ success: false, message: 'Intake record not found' });
    if (!intake.hasDiscrepancy) return res.status(400).json({ success: false, message: 'This record has no discrepancy to resolve' });
    if (intake.discrepancyResolved) return res.status(400).json({ success: false, message: 'Discrepancy already resolved' });

    const collectionRequest = intake.collectionRequest;
    if (!collectionRequest) {
      return res.status(400).json({ success: false, message: 'No collection request linked to this intake record' });
    }

    // ── Compute adjusted points ───────────────────────────────
    const POINTS_TABLE = { small: 10, medium: 20, large: 30 };
    const basePoints   = POINTS_TABLE[collectionRequest.quantity] || 10;
    let   pointsToAward = 0;

    if (resolution === 'no_change') {
      pointsToAward = 0; // Admin already approved via normal flow or decides no points
    } else if (resolution === 'award_full') {
      pointsToAward = pointsOverride ?? basePoints;
    } else if (resolution === 'award_less') {
      pointsToAward = pointsOverride ?? Math.max(1, Math.floor(basePoints * 0.5));
    } else if (resolution === 'award_more') {
      pointsToAward = pointsOverride ?? Math.round(basePoints * 1.25);
    }

    // ── Award points if applicable ────────────────────────────
    const resident = collectionRequest.resident;
    if (pointsToAward > 0 && resident) {
      await awardPoints(
        resident._id,
        pointsToAward,
        'collection_approved',
        collectionRequest._id,
        `Points awarded after discrepancy resolution (${resolution}). Admin note: ${adminNote || '—'}`
      );

      // Update collection request
      const CollectionRequest = (await import('../../models/CollectionRequest.js')).default;
      await CollectionRequest.findByIdAndUpdate(collectionRequest._id, {
        adminApproved: true,
        approvedBy:    req.user.id,
        approvedAt:    new Date(),
        pointsEarned:  pointsToAward,
        adminNotes:    adminNote || intake.discrepancyNote,
      });

      await createNotification({
        userId:    resident._id,
        type:      'status',
        title:     'Collection points awarded',
        message:   `After reviewing the quantity discrepancy, you received ${pointsToAward} pts. ${adminNote || ''}`,
        relatedId: collectionRequest._id,
        relatedModel: 'CollectionRequest',
      });
    } else if (resolution === 'no_change') {
      await createNotification({
        userId:    resident._id,
        type:      'status',
        title:     'Collection discrepancy reviewed',
        message:   `Admin reviewed the quantity note for your recent collection. ${adminNote || 'No points adjustment was made.'}`,
        relatedId: collectionRequest._id,
        relatedModel: 'CollectionRequest',
      });
    }

    // ── Mark as resolved ──────────────────────────────────────
    intake.discrepancyResolved    = true;
    intake.discrepancyResolution  = resolution;
    intake.pointsOverride         = pointsToAward > 0 ? pointsToAward : null;
    intake.resolvedBy             = req.user.id;
    intake.resolvedAt             = new Date();
    if (adminNote) intake.notes   = `${intake.notes || ''}\n[Admin] ${adminNote}`.trim();
    await intake.save();

    res.status(200).json({
      success: true,
      message: `Discrepancy resolved: ${resolution}. ${pointsToAward > 0 ? `${pointsToAward} pts awarded to resident.` : 'No points awarded.'}`,
      data: {
        resolution,
        pointsAwarded:  pointsToAward,
        residentName:   resident?.fullName || null,
        intake,
      },
    });
  } catch (error) { next(error); }
};
