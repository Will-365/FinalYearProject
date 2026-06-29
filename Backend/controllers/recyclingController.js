import RecyclingCenter from '../models/RecyclingCenter.js';
import DropOffBooking from '../models/DropOffBooking.js';

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// GET /api/recycling/centers/nearest
export const getNearestCenters = async (req, res, next) => {
  try {
    const { district, latitude, longitude, limit = 10 } = req.query;
    const filter = { isActive: true };
    if (district) filter.district = new RegExp(district, 'i');

    let centers = await RecyclingCenter.find(filter).lean();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      centers = centers
        .map((c) => ({
          ...c,
          distanceKm: haversineKm(lat, lng, c.latitude, c.longitude),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    res.status(200).json({
      success: true,
      data: {
        centers: centers.slice(0, parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/recycling/centers (Admin only)
export const createCenter = async (req, res, next) => {
  try {
    const { name, address, district, sector, latitude, longitude, hours, phone, acceptedMaterials } = req.body;
    
    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Name, address, latitude, and longitude are required' });
    }

    const center = await RecyclingCenter.create({
      name,
      address,
      district: district || 'Kigali',
      sector: sector || 'Kigali',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      hours: hours || 'Mon-Sat 8:00 AM - 6:00 PM',
      phone: phone || '',
      acceptedMaterials: acceptedMaterials || ['plastic', 'paper', 'glass', 'metal'],
      isActive: true
    });

    res.status(201).json({ success: true, message: 'Recycling center created', data: center });
  } catch (error) {
    next(error);
  }
};

// GET /api/recycling/centers/:id
export const getCenter = async (req, res, next) => {
  try {
    const center = await RecyclingCenter.findById(req.params.id);
    if (!center || !center.isActive) {
      return res.status(404).json({ success: false, message: 'Center not found' });
    }
    res.status(200).json({ success: true, data: center });
  } catch (error) {
    next(error);
  }
};

// POST /api/recycling/drop-offs
export const scheduleDropOff = async (req, res, next) => {
  try {
    const { centerId, scheduledDate, timeSlot, materialType, estimatedWeight, notes } = req.body;
    if (!centerId || !scheduledDate || !timeSlot || !materialType) {
      return res.status(400).json({ success: false, message: 'centerId, scheduledDate, timeSlot, and materialType are required' });
    }

    const center = await RecyclingCenter.findById(centerId);
    if (!center || !center.isActive) {
      return res.status(404).json({ success: false, message: 'Recycling center not found' });
    }

    const booking = await DropOffBooking.create({
      resident: req.user.id,
      center: centerId,
      scheduledDate,
      timeSlot,
      materialType,
      estimatedWeight: estimatedWeight || 0,
      notes,
    });

    const populated = await DropOffBooking.findById(booking._id).populate('center', 'name address district sector hours phone');
    res.status(201).json({ success: true, message: 'Drop-off scheduled', data: populated });
  } catch (error) {
    next(error);
  }
};

// GET /api/recycling/drop-offs
export const getMyDropOffs = async (req, res, next) => {
  try {
    const bookings = await DropOffBooking.find({ resident: req.user.id })
      .populate('center', 'name address district sector')
      .sort({ scheduledDate: -1 });
    res.status(200).json({ success: true, data: { bookings } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/recycling/drop-offs/:id/cancel
export const cancelDropOff = async (req, res, next) => {
  try {
    const booking = await DropOffBooking.findOne({ _id: req.params.id, resident: req.user.id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: 'Only scheduled drop-offs can be cancelled' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.status(200).json({ success: true, message: 'Drop-off cancelled', data: booking });
  } catch (error) {
    next(error);
  }
};
