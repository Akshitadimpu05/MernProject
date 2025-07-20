const express = require('express');
const router = express.Router();
const { getUserSubmissions, getUserStats } = require('../controllers/submissionController');
const { protect } = require('../middlewares/authMiddleware');

// Routes for user submissions
router.route('/')
  .get(protect, getUserSubmissions);

router.route('/stats')
  .get(protect, getUserStats);

module.exports = router;
