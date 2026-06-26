import Notification from '../models/Notification.js';
import Message from '../models/Message.js';
import BroadcastMessage from '../models/BroadcastMessage.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notificationService.js';

// GET /api/notifications
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
      data: { notifications, unreadCount, pagination: { page: parseInt(page), limit: parseInt(limit), total } },
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

// GET /api/messages?box=inbox|sent
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
      data: { messages, pagination: { page: parseInt(page), limit: parseInt(limit), total } },
    });
  } catch (error) {
    next(error);
  }
};

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

    const sender = await User.findById(req.user.id);
    const message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      subject: subject.trim(),
      body: body.trim(),
    });

    await createNotification({
      userId: recipientId,
      type: 'message',
      title: `Message from ${sender?.fullName || 'User'}`,
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

export const getContacts = async (req, res, next) => {
  try {
    const role = req.user.role;
    let contacts = [];

    if (role === 'admin') {
      contacts = await User.find({ role: { $in: ['resident', 'collector'] }, isActive: true })
        .select('fullName email role location collectorZone')
        .limit(100);
    } else if (role === 'collector') {
      const admins = await User.find({ role: 'admin', isActive: true }).select('fullName email role');
      const residents = await User.find({ role: 'resident', isActive: true }).select('fullName email role location').limit(50);
      return res.status(200).json({ success: true, data: { admins, residents } });
    } else {
      contacts = await User.find({ role: { $in: ['admin', 'collector'] }, isActive: true })
        .select('fullName email role');
    }

    res.status(200).json({ success: true, data: { contacts } });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/notifications/broadcast
export const sendBroadcast = async (req, res, next) => {
  try {
    const { title, body, audience = 'all', targetDistrict, targetSector, type = 'info' } = req.body;
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ success: false, message: 'title and body are required' });
    }

    const userFilter = { isActive: true, isVerified: true };
    if (audience === 'residents') userFilter.role = 'resident';
    else if (audience === 'collectors') userFilter.role = 'collector';
    else if (audience === 'zone') {
      userFilter.role = 'resident';
      if (targetDistrict) userFilter['location.district'] = new RegExp(targetDistrict, 'i');
      if (targetSector) userFilter['location.sector'] = new RegExp(targetSector, 'i');
    } else if (audience !== 'all') {
      return res.status(400).json({ success: false, message: 'Invalid audience' });
    }

    const recipients = await User.find(userFilter).select('_id');
    const broadcast = await BroadcastMessage.create({
      sender: req.user.id,
      title: title.trim(),
      body: body.trim(),
      audience,
      targetDistrict: targetDistrict || null,
      targetSector: targetSector || null,
      type,
      recipientCount: recipients.length,
    });

    await Promise.all(
      recipients.map((u) =>
        createNotification({
          userId: u._id,
          type: audience === 'all' ? 'system' : 'admin',
          title: title.trim(),
          message: body.trim(),
          relatedId: broadcast._id,
          relatedModel: 'BroadcastMessage',
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `Broadcast sent to ${recipients.length} users`,
      data: broadcast,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/notifications/broadcasts
export const getBroadcasts = async (req, res, next) => {
  try {
    const broadcasts = await BroadcastMessage.find()
      .populate('sender', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: { broadcasts } });
  } catch (error) {
    next(error);
  }
};
