import CollectionSchedule from '../../models/CollectionSchedule.js';
import User from '../../models/User.js';

const slotFromTime = (startTime = '') => {
  const hour = parseInt(String(startTime).split(':')[0], 10);
  if (Number.isNaN(hour)) return 'morning';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const normalizeDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(12, 0, 0, 0); // noon avoids timezone day-shift issues
  return d;
};

// GET /api/admin/schedules
export const getAdminSchedules = async (req, res, next) => {
  try {
    const {
      district,
      status,
      page = 1,
      limit = 20,
      from,
      to,
    } = req.query;

    const filter = {};
    if (district) filter['zone.district'] = new RegExp(`^${district}$`, 'i');
    if (status) filter.status = status;
    if (from || to) {
      filter.scheduledDate = {};
      if (from) filter.scheduledDate.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.scheduledDate.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [schedules, total] = await Promise.all([
      CollectionSchedule.find(filter)
        .sort({ scheduledDate: 1, startTime: 1 })
        .skip(skip)
        .limit(limitNum)
        .populate('collector', 'fullName phone')
        .populate('createdBy', 'fullName'),
      CollectionSchedule.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        schedules,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.max(1, Math.ceil(total / limitNum)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/schedules
export const createAdminSchedule = async (req, res, next) => {
  try {
    const {
      title,
      district,
      province,
      sector,
      cell,
      scheduledDate,
      timeSlot,
      startTime,
      endTime,
      wasteTypes,
      collectorId,
      notes,
      status,
    } = req.body;

    if (!district || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'District and scheduled date are required',
      });
    }

    const date = normalizeDate(scheduledDate);
    if (!date) {
      return res.status(400).json({ success: false, message: 'Invalid scheduled date' });
    }

    if (collectorId) {
      const collector = await User.findOne({ _id: collectorId, role: 'collector', isActive: true });
      if (!collector) {
        return res.status(404).json({ success: false, message: 'Active collector not found' });
      }
    }

    const resolvedSlot = timeSlot || slotFromTime(startTime);
    const schedule = await CollectionSchedule.create({
      title: title?.trim() || `Collection — ${district}`,
      zone: {
        province: province || '',
        district: district.trim(),
        sector: sector || '',
        cell: cell || '',
      },
      scheduledDate: date,
      timeSlot: resolvedSlot,
      startTime: startTime || '',
      endTime: endTime || '',
      wasteTypes: Array.isArray(wasteTypes) && wasteTypes.length ? wasteTypes : ['mixed'],
      collector: collectorId || null,
      notes: notes || '',
      status: status || 'upcoming',
      createdBy: req.user.id,
    });

    const populated = await CollectionSchedule.findById(schedule._id)
      .populate('collector', 'fullName phone');

    res.status(201).json({
      success: true,
      message: 'Collection schedule created',
      data: { schedule: populated },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/schedules/:id
export const updateAdminSchedule = async (req, res, next) => {
  try {
    const schedule = await CollectionSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const {
      title,
      district,
      province,
      sector,
      cell,
      scheduledDate,
      timeSlot,
      startTime,
      endTime,
      wasteTypes,
      collectorId,
      notes,
      status,
    } = req.body;

    if (title != null) schedule.title = title.trim() || schedule.title;
    if (district) schedule.zone.district = district.trim();
    if (province != null) schedule.zone.province = province;
    if (sector != null) schedule.zone.sector = sector;
    if (cell != null) schedule.zone.cell = cell;
    if (scheduledDate) {
      const date = normalizeDate(scheduledDate);
      if (!date) return res.status(400).json({ success: false, message: 'Invalid scheduled date' });
      schedule.scheduledDate = date;
    }
    if (startTime != null) schedule.startTime = startTime;
    if (endTime != null) schedule.endTime = endTime;
    if (timeSlot) schedule.timeSlot = timeSlot;
    else if (startTime) schedule.timeSlot = slotFromTime(startTime);
    if (Array.isArray(wasteTypes)) schedule.wasteTypes = wasteTypes;
    if (notes != null) schedule.notes = notes;
    if (status) schedule.status = status;
    if (collectorId !== undefined) {
      if (!collectorId) {
        schedule.collector = null;
      } else {
        const collector = await User.findOne({ _id: collectorId, role: 'collector', isActive: true });
        if (!collector) {
          return res.status(404).json({ success: false, message: 'Active collector not found' });
        }
        schedule.collector = collectorId;
      }
    }

    await schedule.save();
    const populated = await CollectionSchedule.findById(schedule._id)
      .populate('collector', 'fullName phone');

    res.status(200).json({
      success: true,
      message: 'Schedule updated',
      data: { schedule: populated },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/schedules/:id  (cancel)
export const deleteAdminSchedule = async (req, res, next) => {
  try {
    const schedule = await CollectionSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    // Soft-cancel so history remains; hard-delete if already cancelled
    if (schedule.status === 'cancelled') {
      await CollectionSchedule.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: 'Schedule permanently deleted' });
    }

    schedule.status = 'cancelled';
    await schedule.save();
    res.status(200).json({ success: true, message: 'Schedule cancelled', data: { schedule } });
  } catch (error) {
    next(error);
  }
};
