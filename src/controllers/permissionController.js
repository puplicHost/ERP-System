const Permission = require('../models/Permission');

const listPermissions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [permissions, total] = await Promise.all([
      Permission.find()
        .skip(skip)
        .limit(limit)
        .sort({ resource: 1, action: 1 }),
      Permission.countDocuments()
    ]);

    res.success({
      permissions,
      pagination: {
        page,
        limit,
        total,
        last_page: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPermissionById = async (req, res, next) => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return res.error('Permission not found', 404);
    }

    res.success(permission);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPermissions,
  getPermissionById
};
