import WasteCategoryIntake from '../../models/WasteCategoryIntake.js';
import CollectionRequest from '../../models/CollectionRequest.js';

// GET /api/admin/waste-intake
// Paginated intake log with filters
export const getWasteIntakeLog = async (req, res, next) => {
  try {
    const { wasteType, district, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (wasteType) filter.wasteType = wasteType;
    if (district) filter['location.district'] = new RegExp(district, 'i');
    if (dateFrom || dateTo) {
      filter.intakeDate = {};
      if (dateFrom) filter.intakeDate.$gte = new Date(dateFrom);
      if (dateTo) filter.intakeDate.$lte = new Date(dateTo);
    }

    const [records, total] = await Promise.all([
      WasteCategoryIntake.find(filter)
        .sort({ intakeDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('recordedBy', 'fullName role')
        .populate('collectionRequest', 'wasteType quantity status'),
      WasteCategoryIntake.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        records,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/waste-intake/analytics
// Aggregated analytics for dashboard
export const getWasteIntakeAnalytics = async (req, res, next) => {
  try {
    const { period = '30d', district } = req.query;

    const dayMap = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
    const days = dayMap[period] || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const matchFilter = { intakeDate: { $gte: since } };
    if (district) matchFilter['location.district'] = new RegExp(district, 'i');

    const [byCategory, byDistrict, trend, totals] = await Promise.all([
      // Total weight per category
      WasteCategoryIntake.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$wasteType',
            totalWeightKg: { $sum: '$weightKg' },
            count: { $sum: 1 },
            avgWeight: { $avg: '$weightKg' },
          },
        },
        { $sort: { totalWeightKg: -1 } },
      ]),

      // Weight per district
      WasteCategoryIntake.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$location.district',
            totalWeightKg: { $sum: '$weightKg' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalWeightKg: -1 } },
        { $limit: 10 },
      ]),

      // Daily intake trend
      WasteCategoryIntake.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$intakeDate' } },
            totalWeightKg: { $sum: '$weightKg' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Grand totals
      WasteCategoryIntake.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalWeightKg: { $sum: '$weightKg' },
            totalRecords: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Also pull breakdown from CollectionRequest scans for cross-reference
    const scanBreakdown = await CollectionRequest.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: since } } },
      { $group: { _id: '$wasteType', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        totals: totals[0] || { totalWeightKg: 0, totalRecords: 0 },
        byCategory,
        byDistrict,
        trend,
        completedByWasteType: Object.fromEntries(scanBreakdown.map((s) => [s._id, s.count])),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/waste-intake
// Manually log a waste intake record
export const logWasteIntake = async (req, res, next) => {
  try {
    const { wasteType, weightKg, volumeLiters, location, intakeDate, collectionRequestId, processingStatus, notes } = req.body;

    if (!wasteType || !weightKg) {
      return res.status(400).json({ success: false, message: 'wasteType and weightKg are required' });
    }

    const record = await WasteCategoryIntake.create({
      recordedBy: req.user.id,
      wasteType,
      weightKg: parseFloat(weightKg),
      volumeLiters: volumeLiters ? parseFloat(volumeLiters) : null,
      location: location || {},
      intakeDate: intakeDate ? new Date(intakeDate) : new Date(),
      collectionRequest: collectionRequestId || null,
      processingStatus: processingStatus || 'received',
      notes,
    });

    res.status(201).json({ success: true, message: 'Waste intake recorded', data: record });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/waste-intake/:id/status
export const updateIntakeStatus = async (req, res, next) => {
  try {
    const { processingStatus } = req.body;
    const allowed = ['received', 'processing', 'processed', 'disposed', 'converted'];
    if (!allowed.includes(processingStatus)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const record = await WasteCategoryIntake.findByIdAndUpdate(req.params.id, { processingStatus }, { new: true });
    if (!record) return res.status(404).json({ success: false, message: 'Intake record not found' });

    res.status(200).json({ success: true, message: 'Processing status updated', data: record });
  } catch (error) {
    next(error);
  }
};
