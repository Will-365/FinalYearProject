import BinStatusReport from '../models/BinStatusReport.js';
import CollectionRequest from '../models/CollectionRequest.js';
import User from '../models/User.js';

/** Map fill % → default status (overdue is opted-in or auto) */
export const statusFromPercent = (fillPercent) => {
  if (fillPercent <= 20) return 'empty';
  if (fillPercent <= 70) return 'partial';
  return 'full';
};

export const criticalnessFromStatus = (status, fillPercent) => {
  if (status === 'overdue') return 'critical';
  if (status === 'full' || fillPercent >= 85) return 'high';
  if (status === 'partial' || fillPercent >= 40) return 'medium';
  return 'low';
};

const daysSince = (date) => {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
};

// POST /api/collection/bin-status — resident reports bin fill
export const reportBinStatus = async (req, res, next) => {
  try {
    let { fillPercent, status, criticalness, wasteType, note, markOverdue } = req.body;

    fillPercent = Number(fillPercent);
    if (Number.isNaN(fillPercent) || fillPercent < 0 || fillPercent > 100) {
      return res.status(400).json({
        success: false,
        message: 'fillPercent must be a number between 0 and 100',
      });
    }

    const user = await User.findById(req.user.id).select('location fullName phone');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Auto-overdue: no completed collection in 14+ days and bin is at least partial
    const lastCompleted = await CollectionRequest.findOne({
      resident: req.user.id,
      status: 'completed',
    })
      .sort({ updatedAt: -1 })
      .select('updatedAt confirmedAt');

    const lastPickupAt = lastCompleted?.confirmedAt || lastCompleted?.updatedAt || null;
    const daysSincePickup = daysSince(lastPickupAt);
    const autoOverdue = daysSincePickup != null && daysSincePickup >= 14 && fillPercent >= 40;

    if (markOverdue || autoOverdue) {
      status = 'overdue';
    } else if (!['empty', 'partial', 'full', 'overdue'].includes(status)) {
      status = statusFromPercent(fillPercent);
    }

    if (!['low', 'medium', 'high', 'critical'].includes(criticalness)) {
      criticalness = criticalnessFromStatus(status, fillPercent);
    }

    const report = await BinStatusReport.create({
      resident: req.user.id,
      fillPercent,
      status,
      criticalness,
      wasteType: wasteType || 'mixed',
      note: (note || '').slice(0, 300),
      location: {
        province: user.location?.province,
        district: user.location?.district,
        sector: user.location?.sector,
        cell: user.location?.cell,
        village: user.location?.village,
        street: user.location?.street,
      },
      reportedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Bin status reported successfully',
      data: {
        report,
        daysSinceLastPickup: daysSincePickup,
        autoMarkedOverdue: Boolean(autoOverdue && !markOverdue),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/collection/bin-status/me — latest + history for resident
export const getMyBinStatus = async (req, res, next) => {
  try {
    const [latest, history, lastCompleted] = await Promise.all([
      BinStatusReport.findOne({ resident: req.user.id }).sort({ reportedAt: -1 }),
      BinStatusReport.find({ resident: req.user.id })
        .sort({ reportedAt: -1 })
        .limit(10),
      CollectionRequest.findOne({
        resident: req.user.id,
        status: 'completed',
      })
        .sort({ updatedAt: -1 })
        .select('updatedAt confirmedAt'),
    ]);

    const lastPickupAt = lastCompleted?.confirmedAt || lastCompleted?.updatedAt || null;

    res.status(200).json({
      success: true,
      data: {
        latest,
        history,
        daysSinceLastPickup: daysSince(lastPickupAt),
        lastPickupAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
