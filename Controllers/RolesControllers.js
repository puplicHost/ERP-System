const RoleModel = require("../models/RoleModel");
const asyncWrapper = require("../utils/asyncWrapper");
const { paginate } = require("../utils/pagination");

const getAllRoles = asyncWrapper(async (req, res) => {
    const { page, limit } = req.pagination || { page: 1, limit: 10 };

    const result = await paginate(RoleModel, {
        page,
        limit,
        populate: { path: "permissions", select: "name description" },
        sort: { createdAt: -1 }
    });

    res.status(200).json({
        status: "success",
        message: "Roles fetched successfully",
        data: {
            roles: result.data
        },
        pagination: result.pagination
    });
});

const createRole = asyncWrapper(async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ status: "error", message: "Role name is required." });
    }
    const newRole = await RoleModel.create({ name, description });
    res.status(201).json({ status: "success", data: { role: newRole } });
});

const deleteRole = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    await RoleModel.findByIdAndDelete(id);
    res.status(200).json({ status: "success", message: "Role deleted successfully." });
});

const assignPermissions = asyncWrapper(async (req, res) => {
    const { roleId } = req.params;
    const { permissions } = req.body; // Expecting array of permission IDs

    if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ status: "error", message: "Permissions must be an array of IDs." });
    }

    const updatedRole = await RoleModel.findByIdAndUpdate(
        roleId,
        { $set: { permissions: permissions } },
        { new: true, runValidators: true }
    ).populate('permissions');

    if (!updatedRole) {
        return res.status(404).json({ status: "error", message: "Role not found." });
    }

    res.status(200).json({ status: "success", data: { role: updatedRole } });
});

module.exports = {
    getAllRoles,
    createRole,
    deleteRole,
    assignPermissions
};
