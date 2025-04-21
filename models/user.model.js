/**
 * User model for FactNet
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profileImage: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  badges: {
    type: [String],
    default: ['Newcomer']
  },
  factChecksSubmitted: {
    type: Number,
    default: 0
  },
  factChecksApproved: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);