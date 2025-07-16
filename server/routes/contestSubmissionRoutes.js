const express = require('express');
const router = express.Router();
const {
  submitContestSolution,
  runContestCode,
  getSubmissionStatus,
  getContestSubmissions,
  getUserContestSubmissions
} = require('../controllers/contestSubmissionController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Routes for contest submissions
router.post('/contests/:contestId/problems/:problemId/submit', protect, submitContestSolution);
router.post('/contests/:contestId/problems/:problemId/run', protect, runContestCode);
router.get('/contests/submissions/:submissionId', protect, getSubmissionStatus);
router.get('/contests/:contestId/submissions', protect, admin, getContestSubmissions);
router.get('/contests/:contestId/mysubmissions', protect, getUserContestSubmissions);

module.exports = router;
