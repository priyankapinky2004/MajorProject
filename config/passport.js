/**
 * Simplified passport configuration without Google OAuth for initial setup
 */
module.exports = (passport) => {
    console.log('Passport initialized with simplified configuration');
    // For now, we're not setting up any authentication strategies
    
    // Serialize user
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });
  
    // Deserialize user
    passport.deserializeUser(async (id, done) => {
      try {
        // For now, we'll just return the id since we don't have a user model
        done(null, { id });
      } catch (err) {
        done(err, null);
      }
    });
  };