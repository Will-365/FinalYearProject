import AddressHierarchy from '../../models/AddressHierarchy.js';

// GET /api/admin/address?level=district&province=Kigali City
export const getAddressNodes = async (req, res, next) => {
  try {
    const { level, province, district, sector, cell, isActive, page = 1, limit = 100 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (level) filter.level = level;
    if (province) filter.province = new RegExp(`^${province}$`, 'i');
    if (district) filter.district = new RegExp(`^${district}$`, 'i');
    if (sector) filter.sector = new RegExp(`^${sector}$`, 'i');
    if (cell) filter.cell = new RegExp(`^${cell}$`, 'i');
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const [nodes, total] = await Promise.all([
      AddressHierarchy.find(filter)
        .sort({ level: 1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedCollector', 'fullName phone collectorStatus')
        .populate('createdBy', 'fullName')
        .populate('updatedBy', 'fullName'),
      AddressHierarchy.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { nodes, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/address/tree?province=Kigali City
// Returns a nested tree structure for a province
export const getAddressTree = async (req, res, next) => {
  try {
    const { province } = req.query;
    if (!province) return res.status(400).json({ success: false, message: 'province query param is required' });

    const allNodes = await AddressHierarchy.find({ province, isActive: true }).sort({ name: 1 }).lean();

    const build = (level, parentKey, parentVal) => {
      return allNodes
        .filter((n) => n.level === level && (!parentVal || n[parentKey] === parentVal))
        .map((n) => ({
          _id: n._id,
          name: n.name,
          level: n.level,
          collectionDays: n.collectionDays,
          assignedCollector: n.assignedCollector,
          children: level === 'district'
            ? build('sector', 'district', n.name)
            : level === 'sector'
            ? build('cell', 'sector', n.name)
            : level === 'cell'
            ? build('village', 'cell', n.name)
            : [],
        }));
    };

    const tree = {
      province,
      districts: build('district', 'province', province),
    };

    res.status(200).json({ success: true, data: tree });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/address
export const createAddressNode = async (req, res, next) => {
  try {
    const { level, name, province, district, sector, cell, collectionDays, assignedCollector, notes } = req.body;

    if (!level || !name) return res.status(400).json({ success: false, message: 'level and name are required' });

    const LEVEL_ORDER = ['province', 'district', 'sector', 'cell', 'village'];
    if (!LEVEL_ORDER.includes(level)) {
      return res.status(400).json({ success: false, message: `level must be one of: ${LEVEL_ORDER.join(', ')}` });
    }

    // Validate parent exists
    if (level === 'district' && province) {
      const parentExists = await AddressHierarchy.findOne({ level: 'province', name: new RegExp(`^${province}$`, 'i') });
      if (!parentExists) return res.status(400).json({ success: false, message: `Province '${province}' not found` });
    }

    const node = await AddressHierarchy.create({
      level, name, province: province || null, district: district || null,
      sector: sector || null, cell: cell || null,
      collectionDays: collectionDays || [],
      assignedCollector: assignedCollector || null,
      notes: notes || null,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, message: `${level} '${name}' created`, data: node });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This location already exists at this level' });
    }
    next(error);
  }
};

// PUT /api/admin/address/:id
export const updateAddressNode = async (req, res, next) => {
  try {
    const { name, collectionDays, assignedCollector, notes, isActive } = req.body;

    const node = await AddressHierarchy.findById(req.params.id);
    if (!node) return res.status(404).json({ success: false, message: 'Location not found' });

    if (name) node.name = name;
    if (collectionDays) node.collectionDays = collectionDays;
    if (assignedCollector !== undefined) node.assignedCollector = assignedCollector || null;
    if (notes !== undefined) node.notes = notes;
    if (typeof isActive === 'boolean') node.isActive = isActive;
    node.updatedBy = req.user.id;

    await node.save();

    res.status(200).json({ success: true, message: 'Location updated', data: node });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/address/:id
export const deleteAddressNode = async (req, res, next) => {
  try {
    const node = await AddressHierarchy.findById(req.params.id);
    if (!node) return res.status(404).json({ success: false, message: 'Location not found' });

    // Soft delete — deactivate instead of removing to preserve historical data
    node.isActive = false;
    node.updatedBy = req.user.id;
    await node.save();

    res.status(200).json({ success: true, message: `${node.level} '${node.name}' deactivated` });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/address/:id/assign-collector
export const assignCollectorToZone = async (req, res, next) => {
  try {
    const { collectorId } = req.body;

    const node = await AddressHierarchy.findByIdAndUpdate(
      req.params.id,
      { assignedCollector: collectorId || null, updatedBy: req.user.id },
      { new: true }
    ).populate('assignedCollector', 'fullName phone collectorStatus');

    if (!node) return res.status(404).json({ success: false, message: 'Location not found' });

    res.status(200).json({ success: true, message: 'Collector assigned to zone', data: node });
  } catch (error) {
    next(error);
  }
};
