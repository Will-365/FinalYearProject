import WasteCategoryIntake from '../../models/WasteCategoryIntake.js';
import { fetchTurningAdvisory } from '../../utils/weatherService.js';

// GET /api/admin/waste-intake/turning-advisory?district=Gasabo
export const getTurningAdvisory = async (req, res, next) => {
  try {
    const { district = 'Kigali' } = req.query;

    const [advisory, awaitingTurn] = await Promise.all([
      fetchTurningAdvisory(district),
      WasteCategoryIntake.countDocuments({
        wasteType: 'organic',
        processingStatus: { $in: ['sorting', 'turning'] },
        convertedToProduct: false,
      }),
    ]);

    advisory.batchesAwaitingTurn = awaitingTurn;

    res.status(200).json({ success: true, data: advisory });
  } catch (error) {
    next(error);
  }
};
