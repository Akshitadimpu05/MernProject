const express = require('express');
const router = express.Router();
const {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem
} = require('../controllers/problemController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Routes for problems
router.route('/')
  .post(protect, admin, createProblem)
  .get(getProblems);

router.route('/:id')
  .get(getProblemById)
  .put(protect, admin, updateProblem)
  .delete(protect, admin, deleteProblem);

module.exports = router;
