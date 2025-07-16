const Contest = require('../models/Contest');
const Problem = require('../models/Problem');

// @desc    Create a new contest
// @route   POST /api/contests
// @access  Private/Admin
exports.createContest = async (req, res) => {
  const { title, description, startTime, endTime, problems } = req.body;

  try {
    const contest = new Contest({
      title,
      description,
      startTime,
      endTime,
      problems,
      createdBy: req.user.id
    });

    const createdContest = await contest.save();
    res.status(201).json(createdContest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
exports.getContests = async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('problems', 'title difficulty')
      .populate('enrolledUsers', 'id');
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Get a single contest by ID
// @route   GET /api/contests/:id
// @access  Public
exports.getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems');

    if (contest) {
      res.json(contest);
    } else {
      res.status(404).json({ message: 'Contest not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Update a contest
// @route   PUT /api/contests/:id
// @access  Private/Admin
exports.updateContest = async (req, res) => {
  const { title, description, startTime, endTime, problems } = req.body;

  try {
    const contest = await Contest.findById(req.params.id);

    if (contest) {
      contest.title = title || contest.title;
      contest.description = description || contest.description;
      contest.startTime = startTime || contest.startTime;
      contest.endTime = endTime || contest.endTime;
      contest.problems = problems || contest.problems;

      const updatedContest = await contest.save();
      res.json(updatedContest);
    } else {
      res.status(404).json({ message: 'Contest not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete a contest
// @route   DELETE /api/contests/:id
// @access  Private/Admin
exports.deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);

    if (contest) {
      res.json({ message: 'Contest removed' });
    } else {
      res.status(404).json({ message: 'Contest not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Enroll in a contest
// @route   POST /api/contests/:id/enroll
// @access  Private
exports.enrollInContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (contest) {
      if (contest.enrolledUsers.includes(req.user.id)) {
        return res.status(400).json({ message: 'Already enrolled in this contest' });
      }

      contest.enrolledUsers.push(req.user.id);
      await contest.save();
      res.json({ message: 'Enrolled successfully' });
    } else {
      res.status(404).json({ message: 'Contest not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
