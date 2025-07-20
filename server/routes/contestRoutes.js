const express = require('express');
const router = express.Router();
const {
  createContest,
  getContests,
  getContestById,
  updateContest,
  deleteContest,
  enrollInContest
} = require('../controllers/contestController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Routes for contests
router.route('/')
  .post(protect, admin, createContest)
  .get(getContests);

router.route('/:id')
  .get(getContestById)
  .put(protect, admin, updateContest)
  .delete(protect, admin, deleteContest);

router.route('/:id/enroll').post(protect, enrollInContest);

module.exports = router;
