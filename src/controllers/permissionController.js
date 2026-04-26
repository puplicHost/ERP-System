const Permission = require('../models/Permission');
const paginate = require('../utils/pagination');

const listPermissions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await paginate(Permission, {}, page, limit);
    
    const permissions = await Permission.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ resource: 1, action: 1 });

    res.success({
      permissions,
      pagination: result.pagination
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
