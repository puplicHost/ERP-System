const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const roleRoutes = require('./roles');
const permissionRoutes = require('./permissions');

router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);

module.exports = router;
