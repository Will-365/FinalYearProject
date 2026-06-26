import User from '../../models/User.js';
import CollectionRequest from '../../models/CollectionRequest.js';
import generateOTP from '../../utils/generateOTP.js';
import { sendWelcomeEmail } from '../../utils/emailService.js';
import bcrypt from 'bcryptjs';

// GET /api/admin/collectors
export const getAllCollectors = async (req, res, next) => {
  try {
    const { status, district, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { role: 'collector' };
    if (status) filter.collectorStatus = status;
    if (district) filter['collectorZone.district'] = new RegExp(district, 'i');
    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }

    const [collectors, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password -otp -otpExpiry -otpAttempts'),
      User.countDocuments(filter),
    ]);

    // Attach active assignment count per collector
    const collectorIds = collectors.map((c) => c._id);
    const activeCounts = await CollectionRequest.aggregate([
      { $match: { collector: { $in: collectorIds }, status: { $in: ['assigned', 'in_progress'] } } },
      { $group: { _id: '$collector', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(activeCounts.map((a) => [a._id.toString(), a.count]));

    const enriched = collectors.map((c) => ({
      ...c.toObject(),
      activeAssignments: countMap[c._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        collectors: enriched,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/collectors/:id
export const getCollectorById = async (req, res, next) => {
  try {
    const collector = await User.findOne({ _id: req.params.id, role: 'collector' }).select(
      '-password -otp -otpExpiry -otpAttempts'
    );
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });

    // Recent assignments
    const recentAssignments = await CollectionRequest.find({ collector: collector._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('resident', 'fullName phone')
      .select('wasteType quantity status preferredDate location priority createdAt');

    // Stats
    const stats = await CollectionRequest.aggregate([
      { $match: { collector: collector._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const statsMap = Object.fromEntries(stats.map((s) => [s._id, s.count]));

    res.status(200).json({
      success: true,
      data: {
        collector,
        stats: {
          totalAssigned: Object.values(statsMap).reduce((a, b) => a + b, 0),
          completed: statsMap.completed || 0,
          inProgress: statsMap.in_progress || 0,
          assigned: statsMap.assigned || 0,
        },
        recentAssignments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/collectors
export const createCollector = async (req, res, next) => {
  try {
    const { fullName, email, phone, nationalId, password, collectorZone, vehicleType } = req.body;

    if (!fullName || !email || !phone || !nationalId || !password) {
      return res.status(400).json({ success: false, message: 'fullName, email, phone, nationalId, and password are required' });
    }

    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { nationalId }] });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: exists.email === email.toLowerCase() ? 'Email already registered' : 'National ID already registered',
      });
    }

    const collector = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      nationalId,
      password,
      role: 'collector',
      isVerified: true, // Admin-created collectors are pre-verified
      collectorZone: collectorZone || {},
      vehicleType: vehicleType || 'motorcycle',
      collectorStatus: 'available',
      isActive: true,
    });

    // Try send welcome email
    try {
      await sendWelcomeEmail(collector.email, collector.fullName);
    } catch (e) {
      console.error('Welcome email failed:', e.message);
    }

    const { password: _p, otp: _o, ...safe } = collector.toObject();

    res.status(201).json({
      success: true,
      message: `Collector ${fullName} created successfully`,
      data: safe,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/collectors/:id
export const updateCollector = async (req, res, next) => {
  try {
    const { fullName, email, phone, nationalId, collectorZone, vehicleType, collectorStatus, isActive, password } = req.body;

    const collector = await User.findOne({ _id: req.params.id, role: 'collector' });
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });

    // Check email uniqueness if changing
    if (email && email.toLowerCase() !== collector.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: collector._id } });
      if (emailTaken) return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    if (fullName) collector.fullName = fullName;
    if (email) collector.email = email.toLowerCase();
    if (phone) collector.phone = phone;
    if (nationalId) collector.nationalId = nationalId;
    if (collectorZone) collector.collectorZone = collectorZone;
    if (vehicleType) collector.vehicleType = vehicleType;
    if (collectorStatus) collector.collectorStatus = collectorStatus;
    if (typeof isActive === 'boolean') collector.isActive = isActive;

    // If admin sets a new password
    if (password) {
      if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
      collector.password = password; // pre-save hook will hash it
    }

    await collector.save();

    const { password: _p, otp: _o, otpExpiry: _oe, otpAttempts: _oa, ...safe } = collector.toObject();

    res.status(200).json({ success: true, message: 'Collector updated successfully', data: safe });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/collectors/:id
// Soft delete — deactivates and anonymises; hard delete risks breaking history
export const deleteCollector = async (req, res, next) => {
  try {
    const collector = await User.findOne({ _id: req.params.id, role: 'collector' });
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });

    // Check active assignments
    const activeCount = await CollectionRequest.countDocuments({
      collector: collector._id,
      status: { $in: ['assigned', 'in_progress'] },
    });
    if (activeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete collector with ${activeCount} active assignment(s). Reassign or cancel them first.`,
      });
    }

    collector.isActive = false;
    collector.collectorStatus = 'offline';
    collector.email = `deleted_${collector._id}@greencare.rw`; // free up email
    await collector.save();

    res.status(200).json({ success: true, message: 'Collector deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/collectors/:id/status
export const updateCollectorStatus = async (req, res, next) => {
  try {
    const { collectorStatus } = req.body;
    const allowed = ['available', 'on_route', 'offline'];
    if (!allowed.includes(collectorStatus)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const collector = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'collector' },
      { collectorStatus },
      { new: true }
    ).select('-password -otp -otpExpiry -otpAttempts');

    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });

    res.status(200).json({ success: true, message: 'Collector status updated', data: collector });
  } catch (error) {
    next(error);
  }
};
