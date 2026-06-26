import WasteScan from '../models/WasteScan.js';
import CollectionRequest from '../models/CollectionRequest.js';
import DropOffBooking from '../models/DropOffBooking.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const CO2_KG_PER_SCAN = {
  plastic: 2.5,
  paper: 1.8,
  glass: 0.9,
  metal: 3.2,
  organic: 0.5,
  electronic: 4.0,
  mixed: 1.5,
  default: 1.2,
};

const LANDFILL_KG_FACTOR = 0.8;

// GET /api/waste/environmental-impact
export const getEnvironmentalImpact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [user, scans, completedCollections, dropOffs] = await Promise.all([
      User.findById(userId).select('totalWasteScans totalCollections totalPointsEarned points'),
      WasteScan.find({ user: userId }).select('materialType confidence createdAt'),
      CollectionRequest.find({ resident: userId, status: 'completed' }).select('wasteType quantity updatedAt'),
      DropOffBooking.find({ resident: userId, status: 'completed' }).select('materialType estimatedWeight'),
    ]);

    const wasteByType = {};
    scans.forEach((s) => {
      const key = (s.materialType || 'mixed').toLowerCase();
      wasteByType[key] = (wasteByType[key] || 0) + 1;
    });

    completedCollections.forEach((c) => {
      const key = (c.wasteType || 'mixed').toLowerCase();
      const weight = c.quantity === 'large' ? 15 : c.quantity === 'medium' ? 8 : 3;
      wasteByType[key] = (wasteByType[key] || 0) + weight;
    });

    let co2SavedKg = 0;
    let itemsDiverted = scans.length + completedCollections.length + dropOffs.length;
    Object.entries(wasteByType).forEach(([type, count]) => {
      co2SavedKg += count * (CO2_KG_PER_SCAN[type] || CO2_KG_PER_SCAN.default);
    });
    dropOffs.forEach((d) => {
      co2SavedKg += (d.estimatedWeight || 1) * (CO2_KG_PER_SCAN[d.materialType] || CO2_KG_PER_SCAN.default);
    });

    const landfillDivertedKg = Math.round(co2SavedKg * LANDFILL_KG_FACTOR * 10) / 10;
    co2SavedKg = Math.round(co2SavedKg * 10) / 10;

    const treesEquivalent = Math.round((co2SavedKg / 21) * 10) / 10;

    const monthlyTrend = await WasteScan.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, scans: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          co2SavedKg,
          landfillDivertedKg,
          treesEquivalent,
          itemsDiverted,
          totalScans: user?.totalWasteScans || scans.length,
          totalCollections: user?.totalCollections || completedCollections.length,
          totalPointsEarned: user?.totalPointsEarned || 0,
        },
        wasteByType: Object.entries(wasteByType).map(([type, amount]) => ({ type, amount })),
        monthlyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};
