import User from '../models/User.js';
import PointsLedger from '../models/PointsLedger.js';

/**
 * Award points to a user and log the transaction
 */
export const awardPoints = async (userId, points, source, referenceId = null, description = '') => {
  await Promise.all([
    User.findByIdAndUpdate(userId, {
      $inc: { points, totalPointsEarned: points },
    }),
    PointsLedger.create({
      user: userId,
      points,
      type: 'earned',
      source,
      referenceId,
      description,
    }),
  ]);
};

/**
 * Deduct points from a user and log the transaction
 * Returns false if user doesn't have enough points
 */
export const spendPoints = async (userId, points, source, referenceId = null, description = '') => {
  const user = await User.findById(userId);
  if (!user || user.points < points) {
    return false;
  }

  await Promise.all([
    User.findByIdAndUpdate(userId, { $inc: { points: -points } }),
    PointsLedger.create({
      user: userId,
      points,
      type: 'spent',
      source,
      referenceId,
      description,
    }),
  ]);

  return true;
};

/**
 * Get the current points balance for a user
 */
export const getPointsBalance = async (userId) => {
  const user = await User.findById(userId).select('points totalPointsEarned');
  return user ? { current: user.points, totalEarned: user.totalPointsEarned } : null;
};
