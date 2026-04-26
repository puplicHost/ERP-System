const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Routes
router.get('/', authenticate, authorize('audit:read'), auditLogController.listAuditLogs);
router.get('/:id', authenticate, authorize('audit:read'), auditLogController.getAuditLogById);

module.exports = router;
