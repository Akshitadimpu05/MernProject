const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPremiumStatus } = require('../controllers/premiumController');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST api/premium/create-order
// @desc    Create a new order for premium subscription
// @access  Private
router.post('/create-order', protect, createOrder);

// @route   POST api/premium/verify-payment
// @desc    Verify payment signature
// @access  Private
router.post('/verify-payment', protect, verifyPayment);

// @route   GET api/premium/status
// @desc    Get premium status
// @access  Private
router.get('/status', protect, getPremiumStatus);

module.exports = router;
