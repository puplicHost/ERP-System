const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash token before saving
refreshTokenSchema.pre('save', async function(next) {
  if (!this.isModified('token')) {
    return next();
  }
  
  this.token = crypto.createHash('sha256').update(this.token).digest('hex');
  next();
});

// Method to verify token
refreshTokenSchema.methods.verifyToken = function(candidateToken) {
  const hashedToken = crypto.createHash('sha256').update(candidateToken).digest('hex');
  return this.token === hashedToken;
};

// Index for cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
