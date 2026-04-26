const Role = require('../models/Role');
const paginate = require('../utils/pagination');

const listRoles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await paginate(Role, {}, page, limit);
    
    const roles = await Role.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('permissions', 'name code')
      .sort({ level: 1, name: 1 });

    res.success({
      roles,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getRoleById = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id).populate('permissions');

    if (!role) {
      return res.error('Role not found', 404);
    }

    res.success(role);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRoles,
  getRoleById
};
