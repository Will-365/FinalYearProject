import User from '../models/User.js';
import PointsLedger from '../models/PointsLedger.js';
import { getPointsBalance } from '../utils/pointsService.js';

// GET /api/leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const { scope = 'global', district, limit = 20 } = req.query;

    const matchFilter = {
      role: 'resident',
      isVerified: true,
    };

    // District-level leaderboard
    if (scope === 'district' && district) {
      matchFilter['location.district'] = new RegExp(district, 'i');
    }

    const topUsers = await User.find(matchFilter)
      .sort({ totalPointsEarned: -1 })
      .limit(parseInt(limit))
      .select('fullName location totalPointsEarned totalWasteScans totalCollections points createdAt');

    // Add rank to each user
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      fullName: user.fullName,
      district: user.location?.district || 'N/A',
      sector: user.location?.sector || 'N/A',
      totalPointsEarned: user.totalPointsEarned,
      currentPoints: user.points,
      totalWasteScans: user.totalWasteScans,
      totalCollections: user.totalCollections,
      memberSince: user.createdAt,
    }));

    // Get current user's rank and stats
    const currentUser = await User.findById(req.user.id).select(
      'fullName location totalPointsEarned totalWasteScans totalCollections points'
    );

    let myRank = null;
    if (currentUser) {
      const higherCount = await User.countDocuments({
        ...matchFilter,
        totalPointsEarned: { $gt: currentUser.totalPointsEarned },
      });
      myRank = {
        rank: higherCount + 1,
        totalPointsEarned: currentUser.totalPointsEarned,
        currentPoints: currentUser.points,
        totalWasteScans: currentUser.totalWasteScans,
        totalCollections: currentUser.totalCollections,
      };
    }

    res.status(200).json({
      success: true,
      data: {
        scope,
        leaderboard,
        myRank,
        totalParticipants: await User.countDocuments(matchFilter),
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

    // Get recent activity from points ledger
    const recentActivity = await PointsLedger.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('points type source description createdAt');

    // Global rank
    const globalRank = (await User.countDocuments({
      role: 'resident',
      isVerified: true,
      totalPointsEarned: { $gt: user.totalPointsEarned },
    })) + 1;

    // District rank
    let districtRank = null;
    if (user.location?.district) {
      const districtHigher = await User.countDocuments({
        role: 'resident',
        isVerified: true,
        'location.district': user.location.district,
        totalPointsEarned: { $gt: user.totalPointsEarned },
      });
      districtRank = districtHigher + 1;
    }

    res.status(200).json({
      success: true,
      data: {
        fullName: user.fullName,
        location: user.location,
        currentPoints: user.points,
        totalPointsEarned: user.totalPointsEarned,
        totalWasteScans: user.totalWasteScans,
        totalCollections: user.totalCollections,
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
