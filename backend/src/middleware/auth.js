const User = require('../models/User');

// Single user mode - no authentication needed
const protect = async (req, res, next) => {
  try {
    // Get or create the single default user
    let user = await User.findOne({});
    
    if (!user) {
      user = await User.create({
        email: 'user@jobtracker.local',
        password: 'not-used-single-user-mode'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { protect };
