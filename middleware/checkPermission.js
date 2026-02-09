const RoleModel = require("../models/RoleModel");
const UserModel = require("../models/UserModel"); // Assuming we might need to check dynamic roles assigned to users, but actually we use req.user.role if loaded from DB

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            // 1. Get user role from request (set by Auth middleware)
            const userRoleName = req.decoded.role; // Assuming Auth middleware populates req.decoded
            if (!userRoleName) {
                return res.status(403).json({ status: "error", message: "Access denied. No role found." });
            }

            // 2. Load Role from DB to get permissions
            // We search by 'name' because req.decoded.role (from JWT) usually stores the role Name/String
            const role = await RoleModel.findOne({ name: userRoleName }).populate("permissions");

            if (!role) {
                // Fallback: If role is not in DB (maybe it's a static role like 'Super Admin'), 
                // we might strictly require DB roles for permissions, OR bypass for SuperAdmin.
                // For now, if role not found in DB, deny access (or check if it's SuperAdmin)
                if (userRoleName === "Super Admin") { // Hardcoded Super Admin bypass usually desirable
                    return next();
                }
                return res.status(403).json({ status: "error", message: "Access denied. Role not found." });
            }

            // 3. Check if user has the required permission
            // role.permissions is an array of Permission objects (populated)
            const hasPermission = role.permissions.some(p => p.name === requiredPermission);

            if (!hasPermission) {
                return res.status(403).json({ status: "error", message: "Access denied. Insufficient permissions." });
            }

            next();
        } catch (error) {
            console.error("Permission Check Error:", error);
            res.status(500).json({ status: "error", message: "Internal Server Error during permission check." });
        }
    };
};

module.exports = checkPermission;
