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
      .populate('problemId', 'title difficulty')
      .lean();

    // Get all unique problem IDs from submissions
    const problemIds = [...new Set(submissions.map(sub => sub.problemId ? sub.problemId.toString() : null).filter(Boolean))];
    
    console.log('Problem IDs from submissions:', problemIds);
    
    // Fetch all problems in one query
    let problems = [];
    if (problemIds.length > 0) {
      problems = await Problem.find({
        $or: [
          { _id: { $in: problemIds.filter(id => id && id.match(/^[0-9a-fA-F]{24}$/)) } },
          { problemNumber: { $in: problemIds.filter(id => id && !isNaN(parseInt(id))) } }
        ]
      }).lean();
      
      console.log(`Found ${problems.length} problems out of ${problemIds.length} problem IDs`);
    }
    
    // Create a map for quick problem lookup
    const problemMap = {};
    problems.forEach(problem => {
      problemMap[problem._id] = problem;
      // Also map by problemNumber if available
      if (problem.problemNumber) {
        problemMap[problem.problemNumber] = problem;
      }
    });

    // Enhance submissions with problem details
    const enhancedSubmissions = submissions.map(submission => {
      // Check if problemId is already populated or use the map
      const problem = (submission.problemId && typeof submission.problemId === 'object') 
        ? submission.problemId 
        : problemMap[submission.problemId];
      
      return {
        id: submission._id,
        problemId: typeof submission.problemId === 'object' ? submission.problemId._id : submission.problemId,
        problemName: problem ? problem.title : submission.problemName || 'Unknown Problem',
        difficulty: problem ? problem.difficulty : submission.difficulty || 'Unknown',
        status: mapStatusToDisplay(submission.status),
        language: submission.language || 'Unknown',
        runtime: submission.executionTime ? `${submission.executionTime}ms` : 'N/A',
        memory: submission.memoryUsed ? `${submission.memoryUsed.toFixed(1)} MB` : 'N/A',
        timestamp: submission.createdAt || submission.timestamp,
        // Include the full problem object for reference if needed
        problem: problem || null
      };
    });

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
    
    // Process submissions to get unique problem IDs
    submissions.forEach(submission => {
      if (submission.problemId) {
        // Convert ObjectId to string if needed
        const problemIdStr = submission.problemId.toString();
        uniqueProblemsAttempted.add(problemIdStr);
        
        // Fix case sensitivity issue in status check
        const status = submission.status ? submission.status.toLowerCase() : '';
        if (status === 'accepted') {
          uniqueProblemsSolved.add(problemIdStr);
        }
      }
    });
    
    // Get all solved problems to determine difficulty counts
    const solvedProblemIds = [...uniqueProblemsSolved].map(id => id.toString()).filter(Boolean);
    
    console.log('Solved problem IDs:', solvedProblemIds);
    
    // Handle the case where problemId might be a problem number instead of an ObjectId
    let problems = [];
    if (solvedProblemIds.length > 0) {
      problems = await Problem.find({
        $or: [
          { _id: { $in: solvedProblemIds.filter(id => id && id.match(/^[0-9a-fA-F]{24}$/)) } },
          { problemNumber: { $in: solvedProblemIds.filter(id => id && !isNaN(parseInt(id))) } }
        ]
      }).lean();
      
      console.log(`Found ${problems.length} problems out of ${solvedProblemIds.length} solved problem IDs`);
    }
    
    // Count problems by difficulty
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    
    problems.forEach(problem => {
      if (problem.difficulty === 'Easy') easyCount++;
      else if (problem.difficulty === 'Medium') mediumCount++;
      else if (problem.difficulty === 'Hard') hardCount++;
    });
    
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
  if (!status) return 'Unknown';
  
  // Convert to lowercase for case-insensitive comparison
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'accepted': return 'Accepted';
    case 'wrong_answer': return 'Wrong Answer';
    case 'wrong answer': return 'Wrong Answer';
    case 'error': return 'Runtime Error';
    case 'runtime error': return 'Runtime Error';
    case 'time_limit_exceeded': 
    case 'time limit exceeded': return 'Time Limit Exceeded';
    case 'compilation_error':
    case 'compilation error': return 'Compilation Error';
    case 'pending': return 'Pending';
    default: return status; // Keep original if no match
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
