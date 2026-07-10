import CollectionRequest from '../../models/CollectionRequest.js';
import User from '../../models/User.js';
import WasteCategoryIntake from '../../models/WasteCategoryIntake.js';
import { awardPoints } from '../../utils/pointsService.js';
import { createNotification } from '../../utils/notificationService.js';

const POINTS_TABLE  = { small: 10, medium: 20, large: 30 };
const ORGANIC_BONUS = 5;

// GET /api/admin/collections/summary
export const getCollectionSummary = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo)   dateFilter.createdAt.$lte = new Date(dateTo);
    }

    const [statusBreakdown, priorityBreakdown, wasteTypeBreakdown, dailyTrend, pendingApproval] = await Promise.all([
      CollectionRequest.aggregate([{ $match: dateFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      CollectionRequest.aggregate([{ $match: { ...dateFilter, status: { $ne: 'cancelled' } } }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      CollectionRequest.aggregate([{ $match: dateFilter }, { $group: { _id: '$wasteType', count: { $sum: 1 } } }]),
      CollectionRequest.aggregate([
        { $match: { ...dateFilter, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      CollectionRequest.countDocuments({ status: 'completed', adminApproved: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus:     Object.fromEntries(statusBreakdown.map(s => [s._id, s.count])),
        byPriority:   Object.fromEntries(priorityBreakdown.map(s => [s._id, s.count])),
        byWasteType:  Object.fromEntries(wasteTypeBreakdown.map(s => [s._id, s.count])),
        dailyTrend,
        pendingApproval,
      },
    });
  } catch (error) { next(error); }
};

// GET /api/admin/collections
export const getAllCollectionRequests = async (req, res, next) => {
  try {
    const {
      status, priority, wasteType, district, collectorId, unassigned,
      dateFrom, dateTo, search, pendingApproval,
      page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const filter = {};
    if (status)              filter.status   = status;
    if (priority)            filter.priority = priority;
    if (wasteType)           filter.wasteType = wasteType;
    if (district)            filter['location.district'] = new RegExp(district, 'i');
    if (collectorId)         filter.collector = collectorId;
    if (unassigned === 'true') filter.collector = null;
    if (pendingApproval === 'true') { filter.status = 'completed'; filter.adminApproved = false; }
    if (dateFrom || dateTo) {
      filter.preferredDate = {};
      if (dateFrom) filter.preferredDate.$gte = new Date(dateFrom);
      if (dateTo)   filter.preferredDate.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    let pipeline = [
      { $match: filter },
      { $lookup: { from: 'users', localField: 'resident',  foreignField: '_id', as: 'residentInfo'  } },
      { $unwind: { path: '$residentInfo',  preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'users', localField: 'collector', foreignField: '_id', as: 'collectorInfo' } },
      { $unwind: { path: '$collectorInfo', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      pipeline.push({ $match: { $or: [{ 'residentInfo.fullName': new RegExp(search, 'i') }, { 'residentInfo.phone': new RegExp(search, 'i') }, { 'residentInfo.email': new RegExp(search, 'i') }] } });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    pipeline.push({ $sort: sort }, { $skip: skip }, { $limit: parseInt(limit) });

    const [requests, countResult] = await Promise.all([
      CollectionRequest.aggregate(pipeline),
      CollectionRequest.aggregate(countPipeline),
    ]);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0]?.total || 0, pages: Math.ceil((countResult[0]?.total || 0) / parseInt(limit)) },
      },
    });
  } catch (error) { next(error); }
};

// GET /api/admin/collections/:id
export const getCollectionRequestById = async (req, res, next) => {
  try {
    const request = await CollectionRequest.findById(req.params.id)
      .populate('resident',  'fullName email phone location points')
      .populate('collector', 'fullName phone collectorStatus vehicleType collectorZone')
      .populate('wasteScan', 'wasteType confidence recommendation binColor detectedItems');

    if (!request) return res.status(404).json({ success: false, message: 'Collection request not found' });

    // Attach linked intake record if any
    const intake = await WasteCategoryIntake.findOne({ collectionRequest: request._id })
      .select('wasteType weightKg processingStatus hasDiscrepancy discrepancyNote discrepancyResolved actualWeightKg');

    res.status(200).json({ success: true, data: { request, intake } });
  } catch (error) { next(error); }
};

// POST /api/admin/collections/:id/assign
export const assignPickup = async (req, res, next) => {
  try {
    const { collectorId, scheduledDate, collectionNote } = req.body;
    if (!collectorId) return res.status(400).json({ success: false, message: 'collectorId is required' });

    const collector = await User.findOne({ _id: collectorId, role: 'collector', isActive: true });
    if (!collector) return res.status(404).json({ success: false, message: 'Active collector not found' });

    const request = await CollectionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Collection request not found' });
    if (!['pending', 'assigned'].includes(request.status)) {
      return res.status(400).json({ success: false, message: `Cannot assign request with status '${request.status}'` });
    }

    if (collector.collectorStatus === 'offline') {
      return res.status(400).json({
        success: false,
        message: `${collector.fullName} is offline. Set them to available or on route before assigning.`,
      });
    }

    const wasAlreadyAssigned = String(request.collector) === String(collectorId);
    request.collector    = collectorId;
    request.status       = 'assigned';
    request.assignedAt   = new Date();
    if (scheduledDate)   request.scheduledDate  = new Date(scheduledDate);
    if (collectionNote)  request.collectionNote = collectionNote;
    await request.save();

    if (collector.collectorStatus === 'available') {
      await User.findByIdAndUpdate(collectorId, { collectorStatus: 'on_route' });
    }

    const totalActive = await CollectionRequest.countDocuments({
      collector: collectorId,
      status: { $in: ['assigned', 'in_progress'] },
    });

    await createNotification({
      userId:  collectorId,
      type:    'assignment',
      title:   totalActive > 1 ? 'Additional pickup assigned' : 'New pickup assigned',
      message: `Pickup in ${request.location?.district || 'your zone'}: ${request.quantity} ${request.wasteType} waste. You now have ${totalActive} active task${totalActive > 1 ? 's' : ''}. Preferred: ${new Date(request.preferredDate).toLocaleDateString('en-RW')} ${request.preferredTimeSlot}.`,
      relatedId: request._id, relatedModel: 'CollectionRequest',
    });

    const populated = await CollectionRequest.findById(request._id)
      .populate('resident',  'fullName phone location')
      .populate('collector', 'fullName phone vehicleType');

    res.status(200).json({
      success: true,
      message: totalActive > 1
        ? `Pickup assigned to ${collector.fullName} (${totalActive} active tasks)`
        : `Pickup assigned to ${collector.fullName}`,
      data: { request: populated, activeAssignments: totalActive, wasReassignment: wasAlreadyAssigned },
    });
  } catch (error) { next(error); }
};

// PATCH /api/admin/collections/:id/unassign
export const unassignPickup = async (req, res, next) => {
  try {
    const request = await CollectionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'assigned') return res.status(400).json({ success: false, message: 'Only assigned requests can be unassigned' });

    const prevCollector = request.collector;
    request.collector    = null;
    request.status       = 'pending';
    request.assignedAt   = null;
    await request.save();

    if (prevCollector) {
      const remaining = await CollectionRequest.countDocuments({ collector: prevCollector, status: { $in: ['assigned', 'in_progress'] } });
      if (remaining === 0) await User.findByIdAndUpdate(prevCollector, { collectorStatus: 'available' });
    }

    res.status(200).json({ success: true, message: 'Pickup unassigned. Request is now pending.', data: request });
  } catch (error) { next(error); }
};

// PATCH /api/admin/collections/:id/priority
export const setRequestPriority = async (req, res, next) => {
  try {
    const { priority, adminNotes } = req.body;
    if (!['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'priority must be high, medium, or low' });
    }
    const update = { priority };
    if (adminNotes) update.adminNotes = adminNotes;
    const request = await CollectionRequest.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('resident', 'fullName phone').populate('collector', 'fullName phone');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.status(200).json({ success: true, message: `Priority set to ${priority}`, data: request });
  } catch (error) { next(error); }
};

// PATCH /api/admin/collections/:id/status
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const allowed = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });

    const update = { status };
    if (adminNotes) update.adminNotes = adminNotes;
    if (status === 'completed') update.confirmedAt = new Date();

    const request = await CollectionRequest.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('resident', 'fullName phone').populate('collector', 'fullName phone');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (status === 'completed' && request.collector) {
      await User.findByIdAndUpdate(request.collector, { $inc: { totalPickups: 1 } });
    }

    if (status === 'in_progress' && request.resident) {
      await createNotification({
        userId:  request.resident,
        type:    'status',
        title:   'Collection in progress 🚛',
        message: 'Your waste is being collected right now.',
        relatedId: request._id, relatedModel: 'CollectionRequest',
      });
    }

    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: request });
  } catch (error) { next(error); }
};

// POST /api/admin/collections/:id/approve
// Award points to resident after admin approves a completed collection
export const approveCollection = async (req, res, next) => {
  try {
    const request = await CollectionRequest.findById(req.params.id)
      .populate('resident', '_id fullName points');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'completed') {
      return res.status(400).json({ success: false, message: `Collection must be completed before approval. Status: ${request.status}` });
    }
    if (request.adminApproved) {
      return res.status(400).json({ success: false, message: 'Collection already approved and points awarded' });
    }

    // Check if there's an unresolved discrepancy — warn but don't block
    const intake = await WasteCategoryIntake.findOne({ collectionRequest: request._id });
    if (intake?.hasDiscrepancy && !intake?.discrepancyResolved) {
      return res.status(400).json({
        success: false,
        message: 'This collection has a quantity discrepancy reported by the collector. Please resolve it first via waste-intake discrepancy resolution.',
        discrepancyNote: intake.discrepancyNote,
        intakeId: intake._id,
      });
    }

    const base     = POINTS_TABLE[request.quantity] || 10;
    const bonus    = request.wasteType === 'organic' ? ORGANIC_BONUS : 0;
    const total    = base + bonus;

    await awardPoints(
      request.resident._id,
      total,
      'collection_approved',
      request._id,
      `Collection approved by admin. ${request.quantity} ${request.wasteType} waste.${bonus ? ` Organic bonus: +${bonus} pts.` : ''}`
    );

    request.adminApproved = true;
    request.approvedBy    = req.user.id;
    request.approvedAt    = new Date();
    request.pointsEarned  = total;
    await request.save();

    await User.findByIdAndUpdate(request.resident._id, { $inc: { totalCollections: 1 } });

    await createNotification({
      userId:  request.resident._id,
      type:    'admin',
      title:   '✅ Collection approved!',
      message: `Your ${request.wasteType} waste collection was approved. +${total} pts added${bonus ? ` (includes +${bonus} organic bonus)` : ''}.`,
      relatedId: request._id, relatedModel: 'CollectionRequest',
    });

    res.status(200).json({
      success: true,
      message: `Approved — ${total} pts awarded to ${request.resident.fullName}`,
      data: { pointsAwarded: total, base, bonus, resident: request.resident.fullName },
    });
  } catch (error) { next(error); }
};
