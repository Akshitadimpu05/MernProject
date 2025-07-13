const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');

// @desc    Get user submissions
// @route   GET /api/submissions
// @access  Private
exports.getUserSubmissions = async (req, res) => {
  try {
    // Get submissions for the logged-in user
    const submissions = await Submission.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Enhance submissions with problem details
    const enhancedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        try {
          const problem = await Problem.findById(submission.problemId).lean();
          
          return {
            id: submission._id,
            problemId: submission.problemId,
            problemName: problem ? problem.title : 'Unknown Problem',
            difficulty: problem ? problem.difficulty : 'Unknown',
            status: mapStatusToDisplay(submission.status),
            language: submission.language,
            runtime: `${submission.executionTime || 0}ms`,
            memory: `${(submission.memoryUsed || 0).toFixed(1)} MB`,
            timestamp: submission.createdAt
          };
        } catch (error) {
          console.error(`Error processing submission ${submission._id}:`, error);
          return {
            id: submission._id,
            problemId: submission.problemId,
            problemName: 'Error retrieving problem',
            difficulty: 'Unknown',
            status: mapStatusToDisplay(submission.status),
            language: submission.language,
            runtime: `${submission.executionTime || 0}ms`,
            memory: `${(submission.memoryUsed || 0).toFixed(1)} MB`,
            timestamp: submission.createdAt
          };
        }
      })
    );

    res.json(enhancedSubmissions);
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user stats
// @route   GET /api/submissions/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all submissions for the user
    const submissions = await Submission.find({ userId }).lean();
    
    // Calculate unique problems solved and attempted
    const uniqueProblemsSolved = new Set();
    const uniqueProblemsAttempted = new Set();
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    
    // Process each submission
    await Promise.all(
      submissions.map(async (submission) => {
        uniqueProblemsAttempted.add(submission.problemId);
        
        if (submission.status === 'accepted') {
          uniqueProblemsSolved.add(submission.problemId);
          
          // Get problem difficulty
          try {
            const problem = await Problem.findById(submission.problemId).lean();
            if (problem) {
              if (problem.difficulty === 'Easy') easyCount++;
              else if (problem.difficulty === 'Medium') mediumCount++;
              else if (problem.difficulty === 'Hard') hardCount++;
            }
          } catch (error) {
            console.error(`Error getting problem ${submission.problemId}:`, error);
          }
        }
      })
    );
    
    // Calculate streak (simplified version)
    const streak = calculateStreak(submissions);
    
    // Calculate rank based on problems solved
    const rank = calculateRank(uniqueProblemsSolved.size);
    
    // Calculate points
    const points = calculatePoints(uniqueProblemsSolved.size, submissions.length);
    
    const stats = {
      solved: uniqueProblemsSolved.size,
      attempted: uniqueProblemsAttempted.size,
      totalSubmissions: submissions.length,
      streak,
      rank,
      points,
      easyCount,
      mediumCount,
      hardCount
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to map internal status to display status
function mapStatusToDisplay(status) {
  switch (status) {
    case 'accepted': return 'Accepted';
    case 'wrong_answer': return 'Wrong Answer';
    case 'error': return 'Runtime Error';
    case 'pending': return 'Pending';
    default: return status;
  }
}

// Helper function to calculate streak (simplified)
function calculateStreak(submissions) {
  // This is a simplified version - in a real app, you'd check for consecutive days
  return Math.min(5, Math.floor(submissions.length / 3));
}

// Helper function to calculate rank
function calculateRank(problemsSolved) {
  if (problemsSolved >= 50) return 'Expert';
  if (problemsSolved >= 25) return 'Advanced';
  if (problemsSolved >= 10) return 'Intermediate';
  return 'Beginner';
}

// Helper function to calculate points
function calculatePoints(problemsSolved, totalSubmissions) {
  return problemsSolved * 100 + Math.max(0, problemsSolved * 10 - (totalSubmissions - problemsSolved) * 5);
}
