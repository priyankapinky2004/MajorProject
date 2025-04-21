/**
 * Authentication routes for FactNet
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const logger = require('../config/logger');

// Google OAuth login route
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL + '/login-failed',
    successRedirect: process.env.FRONTEND_URL
  })
);

// Check if user is authenticated
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    logger.info('User logged out');
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;