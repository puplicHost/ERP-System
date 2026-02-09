const PermissionModel = require("../models/PermissionModel");
const asyncWrapper = require("../utils/asyncWrapper");

const createPermission = asyncWrapper(async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ status: "error", message: "Name and description are required." });
    }
    const newPermission = await PermissionModel.create({
        name: name.toUpperCase(),
        description
    });
    res.status(201).json({ status: "success", data: { permission: newPermission } });
});

const getAllPermissions = asyncWrapper(async (req, res) => {
    const permissions = await PermissionModel.find();
    res.status(200).json({ status: "success", data: { permissions } });
});

const deletePermission = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    await PermissionModel.findByIdAndDelete(id);
    res.status(200).json({ status: "success", message: "Permission deleted successfully." });
});

module.exports = {
    createPermission,
    getAllPermissions,
    deletePermission
};
