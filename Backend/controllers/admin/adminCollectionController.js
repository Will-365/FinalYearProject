import CollectionRequest from '../../models/CollectionRequest.js';
import User from '../../models/User.js';
import WasteCategoryIntake from '../../models/WasteCategoryIntake.js';
import { createNotification } from '../../utils/notificationService.js';
import { awardPoints } from '../../utils/pointsService.js';
import { grantCouponToUser, findRewardCouponForWaste } from '../../utils/couponRewardService.js';

// Points awarded to a resident when an admin approves a completed collection
const COLLECTION_POINTS = { small: 10, medium: 20, large: 30 };
const ORGANIC_BONUS = 5;

export const computeCollectionPoints = (request) => {
  const base = COLLECTION_POINTS[request.quantity] || 10;
  const bonus = request.wasteType === 'organic' ? ORGANIC_BONUS : 0;
  return base + bonus;
};

// GET /api/admin/collections
// Full-featured filtered list of all collection requests
export const getAllCollectionRequests = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      wasteType,
      district,
      collectorId,
      unassigned,
      adminApproved,
      dateFrom,
      dateTo,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (wasteType) filter.wasteType = wasteType;
    if (district) filter['location.district'] = new RegExp(district, 'i');
    if (collectorId) filter.collector = collectorId;
    if (unassigned === 'true') filter.collector = null;
    if (adminApproved === 'true') filter.adminApproved = true;
    if (adminApproved === 'false') filter.adminApproved = false;
    if (dateFrom || dateTo) {
      filter.preferredDate = {};
      if (dateFrom) filter.preferredDate.$gte = new Date(dateFrom);
      if (dateTo) filter.preferredDate.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Resident search via $lookup
    let pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'resident',
          foreignField: '_id',
          as: 'residentInfo',
          pipeline: [{ $project: { fullName: 1, email: 1, phone: 1, location: 1 } }],
        },
      },
      { $unwind: { path: '$residentInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'collector',
          foreignField: '_id',
          as: 'collectorInfo',
          pipeline: [{ $project: { fullName: 1, phone: 1, collectorStatus: 1, vehicleType: 1 } }],
        },
      },
      { $unwind: { path: '$collectorInfo', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'residentInfo.fullName': new RegExp(search, 'i') },
            { 'residentInfo.phone': new RegExp(search, 'i') },
            { 'residentInfo.email': new RegExp(search, 'i') },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    pipeline.push({ $sort: sort }, { $skip: skip }, { $limit: parseInt(limit) });

    const [requests, countResult] = await Promise.all([
      CollectionRequest.aggregate(pipeline),
      CollectionRequest.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;

    // Flatten lookup fields so frontend gets populated resident/collector objects
    const normalized = requests.map((r) => ({
      ...r,
      resident: r.residentInfo || r.resident,
      collector: r.collectorInfo || r.collector,
    }));

    res.status(200).json({
      success: true,
      data: {
        requests: normalized,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/collections/:id
export const getCollectionRequestById = async (req, res, next) => {
  try {
    const request = await CollectionRequest.findById(req.params.id)
      .populate('resident', 'fullName email phone location points')
      .populate('collector', 'fullName phone collectorStatus vehicleType collectorZone')
      .populate('wasteScan', 'wasteType confidence recommendation binColor detectedItems');

    if (!request) return res.status(404).json({ success: false, message: 'Collection request not found' });

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/collections/:id/assign
// Assign a pickup to a collector
export const assignPickup = async (req, res, next) => {
  try {
    const { collectorId, scheduledDate, collectionNote } = req.body;

    if (!collectorId) {
      return res.status(400).json({ success: false, message: 'collectorId is required' });
    }

    // Validate collector
    const collector = await User.findOne({ _id: collectorId, role: 'collector', isActive: true });
    if (!collector) {
      return res.status(404).json({ success: false, message: 'Active collector not found' });
    }

    const request = await CollectionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Collection request not found' });

    if (!['pending', 'assigned'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot assign a request with status '${request.status}'`,
      });
    }

    request.collector = collectorId;
    request.status = 'assigned';
    request.assignedAt = new Date();
    if (scheduledDate) request.scheduledDate = new Date(scheduledDate);
    if (collectionNote) request.collectionNote = collectionNote;
    await request.save();

    // Update collector status to on_route if they were available
    if (collector.collectorStatus === 'available') {
      await User.findByIdAndUpdate(collectorId, { collectorStatus: 'on_route' });
    }

    await createNotification({
      userId: collectorId,
      type: 'assignment',
      title: 'New pickup assigned',
      message: `Pickup in ${[request.location?.sector, request.location?.district].filter(Boolean).join(', ') || 'your zone'} — ${request.wasteType} (${request.quantity}) on ${new Date(request.preferredDate).toLocaleDateString()} ${request.preferredTimeSlot}`,
      relatedId: request._id,
      relatedModel: 'CollectionRequest',
    });

    const residentId = request.resident?._id || request.resident;
    if (residentId) {
      await createNotification({
        userId: residentId,
        type: 'status',
        title: 'Collector assigned',
        message: `${collector.fullName} has been assigned to collect your ${request.wasteType} waste.`,
        relatedId: request._id,
        relatedModel: 'CollectionRequest',
      });
    }

    const populated = await CollectionRequest.findById(request._id)
      .populate('resident', 'fullName phone location')
      .populate('collector', 'fullName phone vehicleType');

    res.status(200).json({
      success: true,
      message: `Pickup assigned to ${collector.fullName} successfully`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/collections/:id/unassign
export const unassignPickup = async (req, res, next) => {
  try {
    const request = await CollectionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Collection request not found' });

    if (request.status !== 'assigned') {
      return res.status(400).json({ success: false, message: 'Only assigned requests can be unassigned' });
    }

    const prevCollector = request.collector;
    request.collector = null;
    request.status = 'pending';
    request.assignedAt = null;
    request.collectionNote = null;
    await request.save();

    // Check if that collector has other active assignments; if not, set back to available
    if (prevCollector) {
      const remaining = await CollectionRequest.countDocuments({
        collector: prevCollector,
        status: { $in: ['assigned', 'in_progress'] },
      });
      if (remaining === 0) {
        await User.findByIdAndUpdate(prevCollector, { collectorStatus: 'available' });
      }
    }

    res.status(200).json({ success: true, message: 'Pickup unassigned. Request is now pending.', data: request });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/collections/:id/priority
// Set request priority: high / medium / low
export const setRequestPriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    if (!['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Priority must be high, medium, or low' });
    }

    const request = await CollectionRequest.findByIdAndUpdate(
      req.params.id,
      { priority, ...(req.body.adminNotes ? { adminNotes: req.body.adminNotes } : {}) },
      { new: true }
    ).populate('resident', 'fullName phone').populate('collector', 'fullName phone');

    if (!request) return res.status(404).json({ success: false, message: 'Collection request not found' });

    res.status(200).json({ success: true, message: `Priority set to ${priority}`, data: request });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/collections/:id/status
// Admin force-update status (e.g. mark in_progress, completed, cancelled)
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const allowed = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const update = { status };
    if (adminNotes) update.adminNotes = adminNotes;
    if (status === 'completed') update.confirmedAt = new Date();

    const request = await CollectionRequest.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('resident', 'fullName phone')
      .populate('collector', 'fullName phone');

    if (!request) return res.status(404).json({ success: false, message: 'Collection request not found' });

    // If completed and collector assigned, increment their total pickups
    if (status === 'completed' && request.collector) {
      await User.findByIdAndUpdate(request.collector, { $inc: { totalPickups: 1 } });
    }

    res.status(200).json({ success: true, message: `Request status updated to ${status}`, data: request });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/collections/:id/approve
// Admin approves a completed collection and awards points to the resident
export const approveCollection = async (req, res, next) => {
  try {
    const { couponId, autoRewardCoupon = true } = req.body;
    const request = await CollectionRequest.findById(req.params.id).populate('resident', 'fullName');
    if (!request) return res.status(404).json({ success: false, message: 'Collection request not found' });

    if (request.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Only completed collections can be approved. Current status: '${request.status}'`,
      });
    }

    if (request.adminApproved) {
      return res.status(400).json({ success: false, message: 'This collection has already been approved' });
    }

    const points = computeCollectionPoints(request);
    const residentId = request.resident?._id || request.resident;

    await awardPoints(
      residentId,
      points,
      'collection_approved',
      request._id,
      `Points awarded for approved ${request.quantity} ${request.wasteType} collection`
    );
    await User.findByIdAndUpdate(residentId, { $inc: { totalCollections: 1 } });

    let couponReward = null;
    const rewardCouponId = couponId || (autoRewardCoupon ? (await findRewardCouponForWaste(request.wasteType))?._id : null);
    if (rewardCouponId) {
      try {
        couponReward = await grantCouponToUser(residentId, rewardCouponId, {
          collectionRequestId: request._id,
          grantedBy: req.user.id,
        });
      } catch (err) {
        console.warn('Coupon reward skipped:', err.message);
      }
    }

    request.adminApproved = true;
    request.approvedAt = new Date();
    request.approvedBy = req.user.id;
    request.pointsEarned = points;
    await request.save();

    const notifMsg = couponReward
      ? `Your ${request.wasteType} collection was approved. You earned ${points} points and coupon "${couponReward.coupon.title}" (code: ${couponReward.code})!`
      : `Your ${request.wasteType} collection was approved. You earned ${points} points!`;

    await createNotification({
      userId: residentId,
      type: 'reward',
      title: 'Collection approved — reward sent!',
      message: notifMsg,
      relatedId: request._id,
      relatedModel: 'CollectionRequest',
    });

    const populated = await CollectionRequest.findById(request._id)
      .populate('resident', 'fullName email phone points')
      .populate('collector', 'fullName phone');

    res.status(200).json({
      success: true,
      message: couponReward
        ? `Approved — ${points} points + coupon ${couponReward.code} sent to ${request.resident?.fullName || 'resident'}`
        : `Approved — ${request.resident?.fullName || 'resident'} received ${points} points`,
      data: {
        request: populated,
        pointsAwarded: points,
        couponReward: couponReward
          ? { code: couponReward.code, title: couponReward.coupon.title, id: couponReward.userCoupon._id }
          : null,
        residentName: request.resident?.fullName || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/collections/summary
// Dashboard summary stats
export const getCollectionSummary = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    const [statusBreakdown, priorityBreakdown, wasteTypeBreakdown, dailyTrend] = await Promise.all([
      CollectionRequest.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      CollectionRequest.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      CollectionRequest.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$wasteType', count: { $sum: 1 } } },
      ]),
      CollectionRequest.aggregate([
        { $match: { ...dateFilter, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: Object.fromEntries(statusBreakdown.map((s) => [s._id, s.count])),
        byPriority: Object.fromEntries(priorityBreakdown.map((s) => [s._id, s.count])),
        byWasteType: Object.fromEntries(wasteTypeBreakdown.map((s) => [s._id, s.count])),
        dailyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};
