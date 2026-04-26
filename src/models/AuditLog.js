const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'read', 'login', 'logout', 'export', 'import']
  },
  entity: {
    type: String,
    required: true
  },
  entityId: {
    type: String,
    default: null
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  method: {
    type: String,
    default: null
  },
  url: {
    type: String,
    default: null
  },
  statusCode: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
