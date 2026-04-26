const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Routes
router.get('/', authenticate, authorize('role:read'), roleController.listRoles);
router.get('/:id', authenticate, authorize('role:read'), roleController.getRoleById);

module.exports = router;
