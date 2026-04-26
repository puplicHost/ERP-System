const AuditLog = require('../models/AuditLog');

const auditLog = (action, entity) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;

    // Override json method to capture response
    res.json = function(data) {
      // Restore original json
      res.json = originalJson;

      // Log audit entry after response is sent
      setImmediate(async () => {
        try {
          if (req.userId) {
            await AuditLog.create({
              user: req.userId,
              action,
              entity,
              entityId: req.params.id || req.body._id || null,
              changes: req.method === 'POST' || req.method === 'PUT' ? req.body : null,
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get('user-agent'),
              method: req.method,
              url: req.originalUrl,
              statusCode: res.statusCode
            });
          }
        } catch (error) {
          console.error('Audit log error:', error);
        }
      });

      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = auditLog;
