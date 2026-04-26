const AuditLog = require('../models/AuditLog');

const listAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.userId) query.user = req.query.userId;
    if (req.query.action) query.action = req.query.action;
    if (req.query.entity) query.entity = req.query.entity;

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .skip(skip)
        .limit(limit)
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 }),
      AuditLog.countDocuments(query)
    ]);

    res.success({
      logs,
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

const getAuditLogById = async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('user', 'firstName lastName email');

    if (!log) {
      return res.error('Audit log not found', 404);
    }

    res.success(log);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listAuditLogs,
  getAuditLogById
};
