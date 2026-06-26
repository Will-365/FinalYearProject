import CollectionRequest from '../models/CollectionRequest.js';
import User from '../models/User.js';
import WasteCategoryIntake from '../models/WasteCategoryIntake.js';
import Order from '../models/Order.js';
import WasteScan from '../models/WasteScan.js';
import mongoose from 'mongoose';

// GET /api/admin/reports?period=7d|30d|90d
export const getAdminReport = async (req, res, next) => {
  try {
    const period = req.query.period || '30d';
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [
      totalResidents,
      totalCollectors,
      collectionsSummary,
      completedCollections,
      pendingRequests,
      wasteIntake,
      ordersCount,
      scansCount,
      dailyCollections,
      byWasteType,
      byDistrict,
      topCollectors,
    ] = await Promise.all([
      User.countDocuments({ role: 'resident', isVerified: true }),
      User.countDocuments({ role: 'collector', isActive: true }),
      CollectionRequest.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      CollectionRequest.countDocuments({ status: 'completed', updatedAt: { $gte: since } }),
      CollectionRequest.countDocuments({ status: 'pending' }),
      WasteCategoryIntake.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$category', totalWeight: { $sum: '$weightKg' }, count: { $sum: 1 } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: since } }),
      WasteScan.countDocuments({ createdAt: { $gte: since } }),
      CollectionRequest.aggregate([
        { $match: { status: 'completed', updatedAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      CollectionRequest.aggregate([
        { $match: { status: 'completed', updatedAt: { $gte: since } } },
        { $group: { _id: '$wasteType', count: { $sum: 1 } } },
      ]),
      CollectionRequest.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$location.district', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      CollectionRequest.aggregate([
        { $match: { status: 'completed', updatedAt: { $gte: since }, collector: { $ne: null } } },
        { $group: { _id: '$collector', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'collector' } },
        { $unwind: '$collector' },
        { $project: { count: 1, fullName: '$collector.fullName' } },
      ]),
    ]);

    const statusMap = Object.fromEntries(collectionsSummary.map((s) => [s._id, s.count]));

    res.status(200).json({
      success: true,
      data: {
        period,
        summary: {
          totalResidents,
          totalCollectors,
          completedCollections,
          pendingRequests,
          ordersCount,
          scansCount,
          assigned: statusMap.assigned || 0,
          inProgress: statusMap.in_progress || 0,
          cancelled: statusMap.cancelled || 0,
        },
        dailyCollections,
        byWasteType,
        byDistrict,
        wasteIntake,
        topCollectors,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/resident?period=30d
export const getResidentReport = async (req, res, next) => {
  try {
    const period = req.query.period || '30d';
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [collections, scans, orders] = await Promise.all([
      CollectionRequest.find({ resident: req.user.id, status: 'completed', updatedAt: { $gte: since } })
        .select('wasteType quantity preferredDate updatedAt')
        .sort({ updatedAt: -1 }),
      WasteScan.find({ user: req.user.id, createdAt: { $gte: since } })
        .select('materialType confidence createdAt')
        .sort({ createdAt: -1 }),
      Order.find({ user: req.user.id, createdAt: { $gte: since } })
        .populate('product', 'name')
        .sort({ createdAt: -1 }),
    ]);

    const wasteByType = {};
    collections.forEach((c) => {
      wasteByType[c.wasteType] = (wasteByType[c.wasteType] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        period,
        collections,
        scans,
        orders,
        wasteByType: Object.entries(wasteByType).map(([type, count]) => ({ type, count })),
      },
    });
  } catch (error) {
    next(error);
  }
};
