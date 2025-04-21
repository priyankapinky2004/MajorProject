/**
 * User routes for FactNet
 */

const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const logger = require('../config/logger');

// Middleware to check if user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Get current user profile
router.get('/profile', ensureAuthenticated, (req, res) => {
  res.json(req.user);
});

// Get user badges
router.get('/badges', ensureAuthenticated, (req, res) => {
  res.json({ 
    badges: req.user.badges,
    trustScore: req.user.trustScore
  });
});

// Get user statistics
router.get('/stats', ensureAuthenticated, async (req, res) => {
  try {
    const stats = {
      factChecksSubmitted: req.user.factChecksSubmitted,
      factChecksApproved: req.user.factChecksApproved,
      trustScore: req.user.trustScore,
      badges: req.user.badges
    };
    
    res.json(stats);
  } catch (err) {
    logger.error('Error fetching user stats:', err);
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
});

// Check and update user badges based on activity
router.post('/update-badges', ensureAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const currentBadges = new Set(user.badges);
    
    // Badge logic - based on user activity
    if (user.factChecksSubmitted >= 5 && !currentBadges.has('Fact Checker')) {
      currentBadges.add('Fact Checker');
    }
    
    if (user.factChecksApproved >= 10 && !currentBadges.has('Trusted Validator')) {
      currentBadges.add('Trusted Validator');
    }
    
    if (user.trustScore >= 80 && !currentBadges.has('Accuracy Expert')) {
      currentBadges.add('Accuracy Expert');
    }
    
    // Update badges in database
    user.badges = Array.from(currentBadges);
    await user.save();
    
    res.json({ 
      message: 'Badges updated successfully',
      badges: user.badges
    });
  } catch (err) {
    logger.error('Error updating badges:', err);
    res.status(500).json({ message: 'Error updating badges' });
  }
});

module.exports = router;