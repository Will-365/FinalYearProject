import express from 'express';
import { getLeaderboard, getMyStats } from '../controllers/leaderboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('resident'));

router.get('/', getLeaderboard);
router.get('/my-stats', getMyStats);

export default router;
