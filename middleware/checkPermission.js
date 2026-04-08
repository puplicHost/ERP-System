const RoleModel = require("../models/RoleModel");

// Middleware للتحقق من صلاحية معينة باستخدام JWT (بدون DB query)
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            // جلب الصلاحيات من JWT token (موضوعة بواسطة authToken middleware)
            const userPermissions = req.decoded?.permissions || [];
            const userRole = req.decoded?.role;

            // SuperAdmin يتمتع بكل الصلاحيات تلقائياً
            if (userRole === "SuperAdmin") {
                return next();
            }

            // التحقق من وجود الصلاحية المطلوبة
            const hasPermission = userPermissions.includes(requiredPermission);

            if (!hasPermission) {
                return res.status(403).json({
                    status: "error",
                    message: "Access denied. Insufficient permissions.",
                    required: requiredPermission
                });
            }

            next();
        } catch (error) {
            console.error("Permission Check Error:", error);
            res.status(500).json({
                status: "error",
                message: "Internal Server Error during permission check."
            });
        }
    };
};

// Middleware للتحقق من عدة صلاحيات (AND logic - كل الصلاحيات مطلوبة)
const checkPermissions = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            const userPermissions = req.decoded?.permissions || [];
            const userRole = req.decoded?.role;

            if (userRole === "SuperAdmin") {
                return next();
            }

            const hasAllPermissions = requiredPermissions.every(p => userPermissions.includes(p));

            if (!hasAllPermissions) {
                return res.status(403).json({
                    status: "error",
                    message: "Access denied. Insufficient permissions.",
                    required: requiredPermissions
                });
            }

            next();
        } catch (error) {
            console.error("Permission Check Error:", error);
            res.status(500).json({
                status: "error",
                message: "Internal Server Error during permission check."
            });
        }
    };
};

// Middleware للتحقق من أي صلاحية من مجموعة (OR logic - صلاحية واحدة تكفي)
const checkAnyPermission = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            const userPermissions = req.decoded?.permissions || [];
            const userRole = req.decoded?.role;

            if (userRole === "SuperAdmin") {
                return next();
            }

            const hasAnyPermission = requiredPermissions.some(p => userPermissions.includes(p));

            if (!hasAnyPermission) {
                return res.status(403).json({
                    status: "error",
                    message: "Access denied. Insufficient permissions.",
                    required: requiredPermissions
                });
            }

            next();
        } catch (error) {
            console.error("Permission Check Error:", error);
            res.status(500).json({
                status: "error",
                message: "Internal Server Error during permission check."
            });
        }
    };
};

module.exports = { checkPermission, checkPermissions, checkAnyPermission };
