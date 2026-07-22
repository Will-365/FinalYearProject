import BinStatusReport from '../../models/BinStatusReport.js';
import CollectionRequest from '../../models/CollectionRequest.js';
import User from '../../models/User.js';

const daysSince = (date) => {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
};

// GET /api/admin/bins/summary
export const getBinStatusSummary = async (req, res, next) => {
  try {
    const { criticalness: critFilter } = req.query;

    // Latest report per resident (location from report, fallback to resident profile)
    const latest = await BinStatusReport.aggregate([
      { $sort: { reportedAt: -1 } },
      {
        $group: {
          _id: '$resident',
          reportId: { $first: '$_id' },
          status: { $first: '$status' },
          criticalness: { $first: '$criticalness' },
          reportDistrict: { $first: '$location.district' },
          reportSector: { $first: '$location.sector' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'resident',
        },
      },
      { $unwind: { path: '$resident', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          reportId: 1,
          status: 1,
          criticalness: 1,
          district: {
            $ifNull: [
              { $cond: [{ $or: [{ $eq: ['$reportDistrict', null] }, { $eq: ['$reportDistrict', ''] }] }, null, '$reportDistrict'] },
              '$resident.location.district',
              'Unknown',
            ],
          },
          sector: {
            $ifNull: [
              { $cond: [{ $or: [{ $eq: ['$reportSector', null] }, { $eq: ['$reportSector', ''] }] }, null, '$reportSector'] },
              '$resident.location.sector',
              '',
            ],
          },
        },
      },
    ]);

    const summary = {
      totalReported: latest.length,
      empty: 0,
      partial: 0,
      full: 0,
      overdue: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const districtSet = new Set();
    const locationMap = {};

    for (const row of latest) {
      if (summary[row.status] != null) summary[row.status] += 1;
      if (summary[row.criticalness] != null) summary[row.criticalness] += 1;

      const district = (row.district && String(row.district).trim()) || 'Unknown';
      if (district && district !== 'Unknown') districtSet.add(district);

      if (!locationMap[district]) {
        locationMap[district] = {
          district,
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          empty: 0,
          partial: 0,
          full: 0,
          overdue: 0,
        };
      }
      locationMap[district].total += 1;
      if (locationMap[district][row.criticalness] != null) locationMap[district][row.criticalness] += 1;
      if (locationMap[district][row.status] != null) locationMap[district][row.status] += 1;
    }

    let byLocation = Object.values(locationMap)
      .filter((loc) => loc.district && loc.district !== 'Unknown')
      .sort((a, b) => {
        const score = (x) => (x.critical || 0) * 4 + (x.high || 0) * 2 + (x.overdue || 0) * 3 + (x.full || 0);
        return score(b) - score(a) || b.total - a.total;
      });

    if (critFilter && ['low', 'medium', 'high', 'critical'].includes(critFilter)) {
      byLocation = byLocation
        .filter((loc) => (loc[critFilter] || 0) > 0)
        .map((loc) => ({
          ...loc,
          matchingCount: loc[critFilter] || 0,
        }))
        .sort((a, b) => b.matchingCount - a.matchingCount);
    }

    const totalResidents = await User.countDocuments({ role: 'resident', isVerified: true });
    summary.notReported = Math.max(0, totalResidents - summary.totalReported);
    summary.totalResidents = totalResidents;
    summary.districts = Array.from(districtSet).sort((a, b) => a.localeCompare(b));
    summary.byLocation = byLocation;

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/bins — latest bin status per resident (table)
export const getBinStatuses = async (req, res, next) => {
  try {
    const {
      status,
      criticalness,
      district,
      sector,
      search,
      page = 1,
      limit = 20,
      sortBy = 'reportedAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const matchStage = {};
    if (status) matchStage.status = status;
    if (criticalness) matchStage.criticalness = criticalness;

    // Pipeline: latest report per resident, then filter / populate-like lookup
    const pipeline = [
      { $sort: { reportedAt: -1 } },
      {
        $group: {
          _id: '$resident',
          reportId: { $first: '$_id' },
          fillPercent: { $first: '$fillPercent' },
          status: { $first: '$status' },
          criticalness: { $first: '$criticalness' },
          wasteType: { $first: '$wasteType' },
          note: { $first: '$note' },
          location: { $first: '$location' },
          reportedAt: { $first: '$reportedAt' },
        },
      },
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'resident',
        },
      },
      { $unwind: '$resident' },
      {
        $addFields: {
          resolvedDistrict: {
            $ifNull: [
              {
                $cond: [
                  {
                    $or: [
                      { $eq: [{ $ifNull: ['$location.district', ''] }, ''] },
                      { $eq: ['$location.district', null] },
                    ],
                  },
                  null,
                  '$location.district',
                ],
              },
              '$resident.location.district',
            ],
          },
          resolvedSector: {
            $ifNull: [
              {
                $cond: [
                  {
                    $or: [
                      { $eq: [{ $ifNull: ['$location.sector', ''] }, ''] },
                      { $eq: ['$location.sector', null] },
                    ],
                  },
                  null,
                  '$location.sector',
                ],
              },
              '$resident.location.sector',
            ],
          },
        },
      },
      {
        $match: {
          'resident.role': 'resident',
          ...(district
            ? { resolvedDistrict: new RegExp(`^${String(district).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
            : {}),
          ...(sector
            ? { resolvedSector: new RegExp(String(sector).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
            : {}),
          ...(search
            ? {
                $or: [
                  { 'resident.fullName': new RegExp(search, 'i') },
                  { 'resident.phone': new RegExp(search, 'i') },
                  { 'resident.email': new RegExp(search, 'i') },
                  { resolvedDistrict: new RegExp(search, 'i') },
                  { resolvedSector: new RegExp(search, 'i') },
                ],
              }
            : {}),
        },
      },
      {
        $project: {
          _id: '$reportId',
          residentId: '$_id',
          fillPercent: 1,
          status: 1,
          criticalness: 1,
          wasteType: 1,
          note: 1,
          reportedAt: 1,
          location: {
            province: { $ifNull: ['$location.province', '$resident.location.province'] },
            district: '$resolvedDistrict',
            sector: '$resolvedSector',
            cell: { $ifNull: ['$location.cell', '$resident.location.cell'] },
            village: { $ifNull: ['$location.village', '$resident.location.village'] },
            street: { $ifNull: ['$location.street', '$resident.location.street'] },
          },
          resident: {
            _id: '$resident._id',
            fullName: '$resident.fullName',
            phone: '$resident.phone',
            email: '$resident.email',
            location: '$resident.location',
          },
        },
      },
    ];

    const sortField = ['reportedAt', 'fillPercent', 'criticalness', 'status'].includes(sortBy)
      ? sortBy
      : 'reportedAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const [items, countArr] = await Promise.all([
      BinStatusReport.aggregate([
        ...pipeline,
        { $sort: { [sortField]: sortDir } },
        { $skip: skip },
        { $limit: limitNum },
      ]),
      BinStatusReport.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const total = countArr[0]?.total || 0;

    // Attach days since last completed pickup
    const residentIds = items.map((i) => i.residentId);
    const lastPickups = await CollectionRequest.aggregate([
      {
        $match: {
          resident: { $in: residentIds },
          status: 'completed',
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: '$resident',
          lastPickupAt: { $first: { $ifNull: ['$confirmedAt', '$updatedAt'] } },
        },
      },
    ]);
    const pickupMap = Object.fromEntries(
      lastPickups.map((p) => [String(p._id), p.lastPickupAt])
    );

    const enriched = items.map((row) => {
      const lastPickupAt = pickupMap[String(row.residentId)] || null;
      return {
        ...row,
        lastPickupAt,
        daysSinceLastPickup: daysSince(lastPickupAt),
      };
    });

    res.status(200).json({
      success: true,
      data: {
        bins: enriched,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.max(1, Math.ceil(total / limitNum)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/bins/:id — single report detail
export const getBinStatusById = async (req, res, next) => {
  try {
    const report = await BinStatusReport.findById(req.params.id).populate(
      'resident',
      'fullName phone email location'
    );
    if (!report) {
      return res.status(404).json({ success: false, message: 'Bin status report not found' });
    }

    const lastCompleted = await CollectionRequest.findOne({
      resident: report.resident._id,
      status: 'completed',
    })
      .sort({ updatedAt: -1 })
      .select('updatedAt confirmedAt status');

    const history = await BinStatusReport.find({ resident: report.resident._id })
      .sort({ reportedAt: -1 })
      .limit(15);

    const lastPickupAt = lastCompleted?.confirmedAt || lastCompleted?.updatedAt || null;

    res.status(200).json({
      success: true,
      data: {
        report,
        history,
        lastPickupAt,
        daysSinceLastPickup: daysSince(lastPickupAt),
      },
    });
  } catch (error) {
    next(error);
  }
};
