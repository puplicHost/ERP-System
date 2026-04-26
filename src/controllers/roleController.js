const Role = require('../models/Role');

const listRoles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      Role.find()
        .skip(skip)
        .limit(limit)
        .populate('permissions', 'name code')
        .sort({ level: 1, name: 1 }),
      Role.countDocuments()
    ]);

    res.success({
      roles,
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
