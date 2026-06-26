import User from '../../models/User.js';
import WasteScan from '../../models/WasteScan.js';
import CollectionRequest from '../../models/CollectionRequest.js';
import PointsLedger from '../../models/PointsLedger.js';

// GET /api/admin/residents
// List all residents with search, location filters, verification filter, pagination
export const getAllResidents = async (req, res, next) => {
  try {
    const { search, district, sector, isVerified, page = 1, limit = 20 } = req.query;

    const filter = { role: 'resident' };
    if (district) filter['location.district'] = new RegExp(district, 'i');
    if (sector) filter['location.sector'] = new RegExp(sector, 'i');
    if (isVerified === 'true') filter.isVerified = true;
    if (isVerified === 'false') filter.isVerified = false;
    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [{ fullName: rx }, { email: rx }, { phone: rx }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [residents, total] = await Promise.all([
      User.find(filter)
        .select('fullName email phone location points totalPointsEarned totalWasteScans totalCollections isVerified createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        residents,
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

// GET /api/admin/residents/:id
// Single resident full profile + recent activity + stats (view only)
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
