import User from '../models/User.js';
import PointsLedger from '../models/PointsLedger.js';

const sanitizeActivity = (entry) => {
  const item = typeof entry.toObject === 'function' ? entry.toObject() : { ...entry };
  const desc = item.description || '';
  const isCoupon =
    item.source === 'coupon_claim' || /coupon/i.test(desc);

  if (isCoupon) {
    const spent = item.type === 'spent' || item.type === 'debit' || Number(item.points) < 0;
    item.description = spent
      ? 'Points redeemed for a reward'
      : 'Points activity';
  } else if (/coupon/i.test(desc)) {
    item.description = desc.replace(/coupon/gi, 'reward');
  }

  return item;
};

// GET /api/leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const { scope = 'global', district } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const matchFilter = {
      role: 'resident',
      isVerified: true,
    };

    if (scope === 'district' && district) {
      matchFilter['location.district'] = new RegExp(district, 'i');
    }

    const [users, totalParticipants] = await Promise.all([
      User.find(matchFilter)
        .sort({ totalPointsEarned: -1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .select('fullName location totalPointsEarned totalWasteScans totalCollections points createdAt'),
      User.countDocuments(matchFilter),
    ]);

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      userId: user._id,
      fullName: user.fullName,
      district: user.location?.district || 'N/A',
      sector: user.location?.sector || 'N/A',
      totalPointsEarned: user.totalPointsEarned || 0,
      currentPoints: user.points || 0,
      totalWasteScans: user.totalWasteScans || 0,
      totalCollections: user.totalCollections || 0,
      memberSince: user.createdAt,
    }));

    const currentUser = await User.findById(req.user.id).select(
      'fullName location totalPointsEarned totalWasteScans totalCollections points'
    );

    let myRank = null;
    if (currentUser) {
      const higherCount = await User.countDocuments({
        ...matchFilter,
        totalPointsEarned: { $gt: currentUser.totalPointsEarned || 0 },
      });
      myRank = {
        rank: higherCount + 1,
        userId: currentUser._id,
        fullName: currentUser.fullName,
        totalPointsEarned: currentUser.totalPointsEarned || 0,
        currentPoints: currentUser.points || 0,
        totalWasteScans: currentUser.totalWasteScans || 0,
        totalCollections: currentUser.totalCollections || 0,
      };
    }

    const totalPages = Math.max(1, Math.ceil(totalParticipants / limit));

    res.status(200).json({
      success: true,
      data: {
        scope,
        leaderboard,
        myRank,
        totalParticipants,
        pagination: {
          page,
          limit,
          total: totalParticipants,
          pages: totalPages,
          hasMore: page < totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/leaderboard/my-stats
export const getMyStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      'fullName location totalPointsEarned totalWasteScans totalCollections points createdAt'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const recentActivityRaw = await PointsLedger.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(15)
      .select('points type source description createdAt');

    const recentActivity = recentActivityRaw.map(sanitizeActivity);

    const globalRank =
      (await User.countDocuments({
        role: 'resident',
        isVerified: true,
        totalPointsEarned: { $gt: user.totalPointsEarned || 0 },
      })) + 1;

    let districtRank = null;
    if (user.location?.district) {
      const districtHigher = await User.countDocuments({
        role: 'resident',
        isVerified: true,
        'location.district': user.location.district,
        totalPointsEarned: { $gt: user.totalPointsEarned || 0 },
      });
      districtRank = districtHigher + 1;
    }

    res.status(200).json({
      success: true,
      data: {
        fullName: user.fullName,
        location: user.location,
        currentPoints: user.points || 0,
        totalPointsEarned: user.totalPointsEarned || 0,
        totalWasteScans: user.totalWasteScans || 0,
        totalCollections: user.totalCollections || 0,
        globalRank,
        districtRank,
        memberSince: user.createdAt,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
