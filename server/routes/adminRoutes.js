const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getAllUsers,
  updateUserRole
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, admin, getDashboardStats);

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, getAllUsers);

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
