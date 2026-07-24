import User from '../../models/User.js';
import WasteScan from '../../models/WasteScan.js';
import CollectionRequest from '../../models/CollectionRequest.js';
import PointsLedger from '../../models/PointsLedger.js';
import BinStatusReport from '../../models/BinStatusReport.js';

// GET /api/admin/residents
export const getAllResidents = async (req, res, next) => {
  try {
    const { search, district, sector, isVerified, page = 1, limit = 20 } = req.query;

    const filter = { role: 'resident', isActive: { $ne: false } };
    if (district) filter['location.district'] = new RegExp(district, 'i');
    if (sector) filter['location.sector'] = new RegExp(sector, 'i');
    if (isVerified === 'true') filter.isVerified = true;
    if (isVerified === 'false') filter.isVerified = false;
    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [{ fullName: rx }, { email: rx }, { phone: rx }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [residents, total] = await Promise.all([
      User.find(filter)
        .select(
          'fullName email phone location points totalPointsEarned totalWasteScans totalCollections isVerified isActive createdAt'
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        residents,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.max(1, Math.ceil(total / limitNum)),
          totalPages: Math.max(1, Math.ceil(total / limitNum)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/residents/:id
export const getResidentById = async (req, res, next) => {
  try {
    const resident = await User.findOne({ _id: req.params.id, role: 'resident' }).select(
      '-password -resetPasswordToken -resetPasswordExpire'
    );

    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    const [scans, collections, ledger, rankCount] = await Promise.all([
      WasteScan.find({ resident: resident._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('-rawGeminiResponse'),
      CollectionRequest.find({ resident: resident._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('collector', 'fullName phone'),
      PointsLedger.find({ user: resident._id }).sort({ createdAt: -1 }).limit(20),
      User.countDocuments({ role: 'resident', points: { $gt: resident.points || 0 } }),
    ]);

    const [totalScans, totalCollections] = await Promise.all([
      WasteScan.countDocuments({ resident: resident._id }),
      CollectionRequest.countDocuments({ resident: resident._id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        resident,
        scans,
        collections,
        pointsLedger: ledger,
        stats: {
          totalScans,
          totalCollections,
          totalPoints: resident.points || 0,
          rank: rankCount + 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/residents/:id
// Soft-delete: deactivate account, free email, cancel open pickups
export const deleteResident = async (req, res, next) => {
  try {
    const resident = await User.findOne({ _id: req.params.id, role: 'resident' });
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    if (resident.isActive === false) {
      return res.status(400).json({ success: false, message: 'Resident is already removed' });
    }

    await CollectionRequest.updateMany(
      {
        resident: resident._id,
        status: { $in: ['pending', 'assigned', 'in_progress'] },
      },
      { $set: { status: 'cancelled' } }
    );

    await BinStatusReport.deleteMany({ resident: resident._id }).catch(() => {});

    const originalName = resident.fullName;
    resident.isActive = false;
    resident.email = `deleted_${resident._id}@greencare.rw`;
    resident.phone = resident.phone ? `deleted_${resident._id}` : resident.phone;
    resident.fullName = `${originalName} (removed)`;
    await resident.save();

    res.status(200).json({
      success: true,
      message: `${originalName} has been removed`,
    });
  } catch (error) {
    next(error);
  }
};
