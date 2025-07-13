const User = require('../models/User');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts for various entities
    const userCount = await User.countDocuments();
    const problemCount = await Problem.countDocuments();
    const contestCount = await Contest.countDocuments();
    const submissionCount = await Submission.countDocuments();
    
    // Get recent submissions
    const recentSubmissions = await Submission.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email');
    
    // Get stats by difficulty
    const easyProblems = await Problem.countDocuments({ difficulty: 'Easy' });
    const mediumProblems = await Problem.countDocuments({ difficulty: 'Medium' });
    const hardProblems = await Problem.countDocuments({ difficulty: 'Hard' });
    
    res.status(200).json({
      userCount,
      problemCount,
      contestCount,
      submissionCount,
      recentSubmissions,
      problemsByDifficulty: {
        easy: easyProblems,
        medium: mediumProblems,
        hard: hardProblems
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.status(200).json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
