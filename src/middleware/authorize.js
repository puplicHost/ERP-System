const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // SuperAdmin has all permissions
    if (req.user.role.code === 'superadmin') {
      return next();
    }

    // Check if user has the required permission
    const hasPermission = req.permissions.includes(requiredPermission);
    
    if (!hasPermission) {
      return res.status(403).json({
        status: 'error',
        message: 'Permission denied',
        required: requiredPermission
      });
    }

    next();
  };
};

module.exports = authorize;
