import CollectionRequest from '../../models/CollectionRequest.js';
import User from '../../models/User.js';
import Notification from '../../models/Notification.js';
import Message from '../../models/Message.js';
import WasteCategoryIntake from '../../models/WasteCategoryIntake.js';
import { createNotification } from '../../utils/notificationService.js';
import mongoose from 'mongoose';

const QUANTITY_KG = { small: 3, medium: 8, large: 15 };

const populatePickup = (query) =>
  query
    .populate('resident', 'fullName phone email location')
    .populate('collector', 'fullName phone vehicleType');

// GET /api/collector/pickups?scope=assigned|requested
export const getPickups = async (req, res, next) => {
  try {
    const { scope = 'assigned', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const collector = await User.findById(req.user.id);

    let filter = {};
    if (scope === 'assigned') {
      filter = { collector: req.user.id, status: { $in: ['assigned', 'in_progress'] } };
    } else if (scope === 'requested') {
      filter = {
        status: 'pending',
        collector: null,
      };
      if (collector?.collectorZone?.district) {
        filter['location.district'] = collector.collectorZone.district;
      }
    } else if (scope === 'history') {
      filter = { collector: req.user.id, status: { $in: ['completed', 'cancelled'] } };
    } else {
      filter = { collector: req.user.id };
    }

    const [requests, total] = await Promise.all([
      populatePickup(CollectionRequest.find(filter).sort({ preferredDate: 1 }).skip(skip).limit(parseInt(limit))),
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
          pages: Math.ceil(total / parseInt(limit)) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/collector/pickups/:id
export const getPickup = async (req, res, next) => {
  try {
    const request = await populatePickup(CollectionRequest.findById(req.params.id));
    if (!request) {
      return res.status(404).json({ success: false, message: 'Pickup not found' });
    }
    const isAssigned = String(request.collector?._id || request.collector) === req.user.id;
    const isOpen =
      request.status === 'pending' &&
      !request.collector;
    if (!isAssigned && !isOpen) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/collector/pickups/:id/status
export const updatePickupStatus = async (req, res, next) => {
  try {
    const { status, collectionNote } = req.body;
    const allowed = ['in_progress', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be in_progress or completed' });
    }

    const request = await CollectionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Pickup not found' });
    }
    if (String(request.collector) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'This pickup is not assigned to you' });
    }

    if (status === 'in_progress' && request.status !== 'assigned') {
      return res.status(400).json({ success: false, message: 'Only assigned pickups can be started' });
    }
    if (status === 'completed' && request.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Pickup must be in progress before completing' });
    }

    request.status = status;
    if (collectionNote) request.collectionNote = collectionNote;
    if (status === 'completed') {
      request.confirmedAt = new Date();
      await User.findByIdAndUpdate(req.user.id, { $inc: { totalPickups: 1 } });

      // Auto-log waste intake for admin to convert into products
      const weightKg = QUANTITY_KG[request.quantity] || 5;
      await WasteCategoryIntake.create({
        recordedBy: req.user.id,
        collectionRequest: request._id,
        wasteType: request.wasteType,
        weightKg,
        location: request.location || {},
        intakeDate: new Date(),
        processingStatus: 'received',
        notes: `Auto-logged from completed pickup #${request._id}`,
      });

      await createNotification({
        userId: request.resident,
        type: 'status',
        title: 'Collection completed',
        message: 'Your waste has been collected. Please confirm in the app — admin will approve your points.',
        relatedId: request._id,
        relatedModel: 'CollectionRequest',
      });

      // Notify admins that waste is ready for processing
      const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
      await Promise.all(
        admins.map((admin) =>
          createNotification({
            userId: admin._id,
            type: 'admin',
            title: 'Waste collected — ready for processing',
            message: `${weightKg}kg ${request.wasteType} collected in ${request.location?.district || 'unknown'}. Convert to products in Recycling module.`,
            relatedId: request._id,
            relatedModel: 'CollectionRequest',
          })
        )
      );
    }

    await request.save();
    const updated = await populatePickup(CollectionRequest.findById(request._id));

    res.status(200).json({
      success: true,
      message: status === 'completed' ? 'Pickup confirmed successfully' : 'Pickup started',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/collector/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { user: req.user.id };
    if (unreadOnly === 'true') filter.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user.id, read: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) || 1 },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.status(200).json({ success: true, data: notif });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// GET /api/collector/messages?box=inbox|sent
export const getMessages = async (req, res, next) => {
  try {
    const { box = 'inbox', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = box === 'sent' ? { sender: req.user.id } : { recipient: req.user.id };

    const [messages, total] = await Promise.all([
      Message.find(filter)
        .populate('sender', 'fullName email role')
        .populate('recipient', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Message.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) || 1 },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/collector/messages
export const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, subject, body } = req.body;
    if (!recipientId || !subject?.trim() || !body?.trim()) {
      return res.status(400).json({ success: false, message: 'recipientId, subject, and body are required' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.isActive) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    const message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      subject: subject.trim(),
      body: body.trim(),
    });

    await createNotification({
      userId: recipientId,
      type: 'message',
      title: `Message from ${(await User.findById(req.user.id))?.fullName || 'Collector'}`,
      message: subject.trim(),
      relatedId: message._id,
      relatedModel: 'Message',
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'fullName email role')
      .populate('recipient', 'fullName email role');

    res.status(201).json({ success: true, message: 'Message sent', data: populated });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/collector/messages/:id/read
export const markMessageRead = async (req, res, next) => {
  try {
    const msg = await Message.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { readByRecipient: true },
      { new: true }
    );
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, data: msg });
  } catch (error) {
    next(error);
  }
};

// GET /api/collector/contacts — admins + recent residents
export const getContacts = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true }).select('fullName email role');
    const recentResidents = await CollectionRequest.find({ collector: req.user.id })
      .populate('resident', 'fullName email role')
      .sort({ updatedAt: -1 })
      .limit(20);
    const residentMap = new Map();
    recentResidents.forEach((r) => {
      if (r.resident?._id) residentMap.set(String(r.resident._id), r.resident);
    });
    res.status(200).json({
      success: true,
      data: { admins, residents: [...residentMap.values()] },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/collector/reports?period=7d|30d|90d
export const getReport = async (req, res, next) => {
  try {
    const period = req.params.period || req.query.period || '30d';
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const collectorId = req.user.id;
    const [completed, inProgress, assigned, missed, dailyTrend, byWasteType, collector] = await Promise.all([
      CollectionRequest.countDocuments({ collector: collectorId, status: 'completed', updatedAt: { $gte: since } }),
      CollectionRequest.countDocuments({ collector: collectorId, status: 'in_progress' }),
      CollectionRequest.countDocuments({ collector: collectorId, status: 'assigned' }),
      CollectionRequest.countDocuments({ collector: collectorId, status: 'cancelled', updatedAt: { $gte: since } }),
      CollectionRequest.aggregate([
        { $match: { collector: new mongoose.Types.ObjectId(collectorId), status: 'completed', updatedAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      CollectionRequest.aggregate([
        { $match: { collector: new mongoose.Types.ObjectId(collectorId), status: 'completed', updatedAt: { $gte: since } } },
        { $group: { _id: '$wasteType', count: { $sum: 1 } } },
      ]),
      User.findById(collectorId).select('fullName totalPickups collectorStatus collectorZone vehicleType'),
    ]);

    const activityLog = await CollectionRequest.find({
      collector: collectorId,
      status: 'completed',
      updatedAt: { $gte: since },
    })
      .populate('resident', 'fullName')
      .sort({ updatedAt: -1 })
      .limit(50)
      .select('wasteType quantity preferredDate preferredTimeSlot updatedAt resident status');

    const totalAssigned = completed + inProgress + assigned;
    const completionRate = totalAssigned ? Math.round((completed / (completed + missed || 1)) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        period,
        summary: {
          completed,
          inProgress,
          assigned,
          missed,
          completionRate,
          totalPickups: collector?.totalPickups || 0,
        },
        dailyTrend,
        byWasteType,
        activityLog,
        collector,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/collector/stats — dashboard KPIs
export const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const collectorId = req.user.id;
    const [collector, todayPickups, completedToday, unreadNotifications, unreadMessages] = await Promise.all([
      User.findById(collectorId).select('fullName collectorZone collectorStatus vehicleType totalPickups'),
      CollectionRequest.countDocuments({
        collector: collectorId,
        preferredDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['assigned', 'in_progress', 'completed'] },
      }),
      CollectionRequest.countDocuments({
        collector: collectorId,
        status: 'completed',
        preferredDate: { $gte: today, $lt: tomorrow },
      }),
      Notification.countDocuments({ user: collectorId, read: false }),
      Message.countDocuments({ recipient: collectorId, readByRecipient: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        collector,
        todayPickups,
        completedToday,
        unreadNotifications,
        unreadMessages,
      },
    });
  } catch (error) {
    next(error);
  }
};
