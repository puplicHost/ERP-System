const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Routes
router.get('/', authenticate, authorize('permission:read'), permissionController.listPermissions);
router.get('/:id', authenticate, authorize('permission:read'), permissionController.getPermissionById);

module.exports = router;
