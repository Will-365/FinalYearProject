import CollectionRequest from '../models/CollectionRequest.js';
import CollectionSchedule from '../models/CollectionSchedule.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notificationService.js';

const isFutureDate = (dateStr) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pick = new Date(d);
  pick.setHours(0, 0, 0, 0);
  return pick >= today;
};

// POST /api/collection/request
export const requestCollection = async (req, res, next) => {
  try {
    const { wasteType, quantity, description, preferredDate, preferredTimeSlot, location, wasteScanId } = req.body;

    if (!wasteType || !quantity || !preferredDate || !preferredTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'wasteType, quantity, preferredDate, and preferredTimeSlot are required',
      });
    }

    const parsedDate = new Date(preferredDate);
    if (!isFutureDate(preferredDate)) {
      return res.status(400).json({ success: false, message: 'preferredDate must be today or a future date' });
    }

    // Use resident's profile location as fallback
    const resident = await User.findById(req.user.id).select('location fullName');
    const finalLocation = location || resident?.location || {};

    const collectionRequest = await CollectionRequest.create({
      resident: req.user.id,
      wasteType,
      quantity,
      description,
      preferredDate: parsedDate,
      preferredTimeSlot,
      location: finalLocation,
      wasteScan: wasteScanId || null,
    });

    // Notify all admins about new pending request
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin._id,
          type: 'admin',
          title: 'New collection request',
          message: `${resident?.fullName || 'A resident'} requested ${wasteType} pickup in ${finalLocation.district || 'unknown district'} — ${quantity} quantity`,
          relatedId: collectionRequest._id,
          relatedModel: 'CollectionRequest',
        })
      )
    );

    res.status(201).json({
      success: true,
      message: 'Collection request submitted successfully. A collector will be assigned shortly.',
      data: collectionRequest,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/collection/my-requests
export const getMyCollectionRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { resident: req.user.id };
    if (status) filter.status = status;

    const [requests, total] = await Promise.all([
      CollectionRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('collector', 'fullName phone')
        .populate('wasteScan', 'wasteType recommendation binColor'),
      CollectionRequest.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/collection/request/:id
export const getCollectionRequestById = async (req, res, next) => {
  try {
    const request = await CollectionRequest.findOne({ _id: req.params.id, resident: req.user.id })
      .populate('collector', 'fullName phone email')
      .populate('wasteScan', 'wasteType recommendation binColor detectedItems');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Collection request not found' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/collection/request/:id/cancel
export const cancelCollectionRequest = async (req, res, next) => {
  try {
    const request = await CollectionRequest.findOne({ _id: req.params.id, resident: req.user.id });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Collection request not found' });
    }

    if (!['pending', 'assigned'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request with status '${request.status}'`,
      });
    }

    request.status = 'cancelled';
    await request.save();

    res.status(200).json({ success: true, message: 'Collection request cancelled', data: request });
  } catch (error) {
    next(error);
  }
};

// POST /api/collection/request/:id/confirm
// Resident acknowledges the collection happened. This only records a confirmation
// flag — points are awarded by an admin after approving the completed collection.
export const confirmCollection = async (req, res, next) => {
  try {
    const request = await CollectionRequest.findOne({ _id: req.params.id, resident: req.user.id });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Collection request not found' });
    }

    if (!['in_progress', 'completed'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Collection can only be confirmed when in progress or completed. Current status: '${request.status}'`,
      });
    }

    request.residentConfirmed = true;
    request.residentConfirmedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for confirming. Your points will be credited once an admin approves the collection.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/collection/schedules
// Track upcoming collection schedules in the resident's zone
export const getCollectionSchedules = async (req, res, next) => {
  try {
    const { district, sector, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Optionally use logged-in user's location if no filter provided
    let locationFilter = {};
    if (district || sector) {
      if (district) locationFilter['zone.district'] = new RegExp(district, 'i');
      if (sector) locationFilter['zone.sector'] = new RegExp(sector, 'i');
    } else {
      // Fall back to resident's saved location
      const resident = await User.findById(req.user.id).select('location');
      if (resident?.location?.district) {
        locationFilter['zone.district'] = new RegExp(resident.location.district, 'i');
      }
    }

    const filter = {
      ...locationFilter,
      status: { $in: ['upcoming', 'in_progress'] },
      scheduledDate: { $gte: new Date() },
    };

    const [schedules, total] = await Promise.all([
      CollectionSchedule.find(filter)
        .sort({ scheduledDate: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('collector', 'fullName phone'),
      CollectionSchedule.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        schedules,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/collection/schedule/:id
export const getScheduleById = async (req, res, next) => {
  try {
    const schedule = await CollectionSchedule.findById(req.params.id).populate('collector', 'fullName phone');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};
