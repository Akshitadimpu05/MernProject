// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { auth } from '../auth/auth';

function Profile() {
  const { user } = useSelector(state => state.user);
  const [activeTab, setActiveTab] = useState('overview');
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    solved: 0,
    attempted: 0,
    totalSubmissions: 0,
    streak: 0,
    rank: 'Beginner',
    points: 0,
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // First fetch submissions, then fetch stats
      fetchSubmissions();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/submissions/stats', {
        headers: { 
          Authorization: `Bearer ${auth.getToken()}` 
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('User stats from API:', data);
        
        // Check if we got valid data
        if (data && typeof data === 'object') {
          // Ensure all required fields are present, use defaults if not
          const statsData = {
            solved: data.solved || 0,
            attempted: data.attempted || 0,
            totalSubmissions: data.totalSubmissions || 0,
            streak: data.streak || 0,
            rank: data.rank || calculateRank(data.solved || 0),
            points: data.points || 0,
            easyCount: data.easyCount || 0,
            mediumCount: data.mediumCount || 0,
            hardCount: data.hardCount || 0
          };
          
          setStats(statsData);
          return; // Exit early since we have real data
        } else {
          console.warn('Invalid stats data format from API');
        }
      } else {
        console.error(`Error fetching user stats: ${response.status}`);
      }
      
      // If API fails or returns invalid data, calculate stats from submissions
      calculateStatsFromSubmissions();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Fallback to calculating from submissions
      calculateStatsFromSubmissions();
    } finally {
      setLoading(false);
    }
  };

  const calculateStatsFromSubmissions = () => {
    if (submissions.length > 0) {
      console.log('Calculating stats from submissions:', submissions);
      
      // Calculate unique problems solved and attempted
      const uniqueProblemsSolved = new Set();
      const uniqueProblemsAttempted = new Set();
      
      // Track problems by difficulty to avoid double counting
      const solvedProblemsByDifficulty = {
        Easy: new Set(),
        Medium: new Set(),
        Hard: new Set()
      };
      
      submissions.forEach(submission => {
        // Make sure we have a valid problemId
        if (submission.problemId) {
          uniqueProblemsAttempted.add(submission.problemId);
          
          if (submission.status === 'Accepted') {
            uniqueProblemsSolved.add(submission.problemId);
            
            // Add to the appropriate difficulty set
            if (submission.difficulty === 'Easy') {
              solvedProblemsByDifficulty.Easy.add(submission.problemId);
            } else if (submission.difficulty === 'Medium') {
              solvedProblemsByDifficulty.Medium.add(submission.problemId);
            } else if (submission.difficulty === 'Hard') {
              solvedProblemsByDifficulty.Hard.add(submission.problemId);
            }
          }
        }
      });
      
      // Count unique problems by difficulty
      const easyCount = solvedProblemsByDifficulty.Easy.size;
      const mediumCount = solvedProblemsByDifficulty.Medium.size;
      const hardCount = solvedProblemsByDifficulty.Hard.size;
      
      const solved = uniqueProblemsSolved.size;
      
      console.log('Stats calculation results:', {
        solved,
        attempted: uniqueProblemsAttempted.size,
        easyCount,
        mediumCount,
        hardCount
      });
      
      setStats({
        solved,
        attempted: uniqueProblemsAttempted.size,
        totalSubmissions: submissions.length,
        streak: Math.min(5, Math.floor(submissions.length / 3)), // Simple streak calculation
        rank: calculateRank(solved),
        points: calculatePoints(solved, submissions.length),
        easyCount,
        mediumCount,
        hardCount
      });
    }
  };
  
  // Helper functions for stats calculation
  const calculateRank = (problemsSolved) => {
    if (problemsSolved >= 50) return 'Expert';
    if (problemsSolved >= 25) return 'Advanced';
    if (problemsSolved >= 10) return 'Intermediate';
    return 'Beginner';
  };
  
  const calculatePoints = (problemsSolved, totalSubmissions) => {
    // Simple formula: 100 points per problem solved + bonus for efficiency
    return problemsSolved * 100 + Math.max(0, problemsSolved * 10 - (totalSubmissions - problemsSolved) * 5);
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/submissions', {
        headers: { 
          Authorization: `Bearer ${auth.getToken()}` 
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.status}`);
      }
      
      let data = await response.json();
      console.log('Raw submission data:', data);
      
      if (Array.isArray(data)) {
        // Process the data to ensure all fields are properly populated
        data = data.map(submission => {
          // Extract problem data more carefully
          let problemName = 'Unknown Problem';
          let difficulty = 'Unknown';
          
          // Try to get problem name from different possible sources
          if (submission.problemName) {
            problemName = submission.problemName;
          } else if (submission.problem && submission.problem.title) {
            problemName = submission.problem.title;
          }
          
          // Try to get difficulty from different possible sources
          if (submission.difficulty) {
            difficulty = submission.difficulty;
          } else if (submission.problem && submission.problem.difficulty) {
            difficulty = submission.problem.difficulty;
          }
          
          return {
            id: submission.id || submission._id,
            problemId: submission.problemId || (submission.problem && submission.problem._id),
            problemName,
            difficulty,
            status: submission.status || 'Unknown',
            language: submission.language || 'Unknown',
            runtime: submission.runtime || 'N/A',
            memory: submission.memory || 'N/A',
            timestamp: submission.timestamp || submission.createdAt || new Date().toISOString()
          };
        });
        
        console.log('Processed submissions:', data);
        setSubmissions(data);
        
        // After successfully fetching submissions, fetch stats
        fetchUserStats();
      } else {
        console.error('Invalid submission data format from API');
        fetchUserStats(); // Still try to fetch stats even if submissions failed
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      
      // Check if we already have submissions data before using mock data
      if (submissions.length === 0) {
        // Only use mock data if we don't have any real data
        const mockSubmissions = [
          { id: 1, problemId: '1', problemName: 'Two Sum', status: 'Accepted', language: 'Python', runtime: '32ms', memory: '14.2 MB', timestamp: '2025-07-10T15:30:00', difficulty: 'Easy' },
          { id: 2, problemId: '3', problemName: 'Longest Substring', status: 'Wrong Answer', language: 'C++', runtime: '48ms', memory: '15.8 MB', timestamp: '2025-07-09T10:15:00', difficulty: 'Medium' },
          { id: 3, problemId: '7', problemName: 'Palindrome Number', status: 'Accepted', language: 'Java', runtime: '56ms', memory: '42.3 MB', timestamp: '2025-07-08T18:45:00', difficulty: 'Easy' },
          { id: 4, problemId: '4', problemName: 'Valid Anagram', status: 'Time Limit Exceeded', language: 'Python', runtime: 'N/A', memory: 'N/A', timestamp: '2025-07-07T09:20:00', difficulty: 'Easy' },
          { id: 5, problemId: '2', problemName: 'Add Two Numbers', status: 'Accepted', language: 'C++', runtime: '28ms', memory: '12.9 MB', timestamp: '2025-07-06T14:10:00', difficulty: 'Medium' },
          { id: 6, problemId: '1', problemName: 'Two Sum', status: 'Accepted', language: 'Java', runtime: '45ms', memory: '39.5 MB', timestamp: '2025-07-05T11:20:00', difficulty: 'Easy' },
          { id: 7, problemId: '9', problemName: 'Merge Sorted Arrays', status: 'Accepted', language: 'Python', runtime: '36ms', memory: '14.8 MB', timestamp: '2025-07-04T16:40:00', difficulty: 'Hard' },
        ];
        setSubmissions(mockSubmissions);
      }
      calculateStatsFromSubmissions();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'text-green-400';
      case 'Wrong Answer': return 'text-red-400';
      case 'Time Limit Exceeded': return 'text-yellow-400';
      case 'Runtime Error': return 'text-orange-400';
      case 'Compilation Error': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Profile header */}
        <div className="bg-dark-surface rounded-lg p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-20 w-20 rounded-full bg-primary-pink flex items-center justify-center text-2xl font-bold mr-6">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{user?.username || 'User'}</h1>
                <p className="text-text-secondary">{user?.email || 'email@example.com'}</p>
                <div className="mt-2 flex items-center">
                  <span className="px-3 py-1 bg-secondary-pink text-white text-sm rounded-full">
                    {stats.rank}
                  </span>
                  <span className="ml-3 text-text-secondary">
                    <span className="text-primary-pink font-semibold">{stats.points}</span> points
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="bg-dark-bg p-3 rounded-lg text-center min-w-[100px]">
                <div className="text-2xl font-bold text-primary-pink">{stats.solved}</div>
                <div className="text-xs text-text-secondary">Problems Solved</div>
              </div>
              <div className="bg-dark-bg p-3 rounded-lg text-center min-w-[100px]">
                <div className="text-2xl font-bold text-accent-pink">{stats.streak}</div>
                <div className="text-xs text-text-secondary">Day Streak</div>
              </div>
              <div className="bg-dark-bg p-3 rounded-lg text-center min-w-[100px]">
                <div className="text-2xl font-bold text-secondary-pink">{stats.totalSubmissions}</div>
                <div className="text-xs text-text-secondary">Submissions</div>
              </div>
            </div>
          </div>
        </div>
        {/* Tab navigation */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'overview' ? 'border-primary-pink text-primary-pink' : 'border-transparent text-text-secondary hover:text-white'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'submissions' ? 'border-primary-pink text-primary-pink' : 'border-transparent text-text-secondary hover:text-white'}`}
            >
              Submissions
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'badges' ? 'border-primary-pink text-primary-pink' : 'border-transparent text-text-secondary hover:text-white'}`}
            >
              Badges & Achievements
            </button>
          </nav>
        </div>
        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Problem solving stats */}
            <div className="col-span-2">
              <div className="bg-dark-surface rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-primary-pink">Problem Solving Stats</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-dark-bg p-4 rounded-lg">
                    <div className="text-sm text-text-secondary mb-1">Easy</div>
                    <div className="flex items-end">
                      <span className="text-2xl font-bold text-green-500">{stats.easyCount || 0}</span>
                      <span className="text-xs text-text-secondary ml-2">solved</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: `${(stats.easyCount / 10) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-dark-bg p-4 rounded-lg">
                    <div className="text-sm text-text-secondary mb-1">Medium</div>
                    <div className="flex items-end">
                      <span className="text-2xl font-bold text-yellow-500">{stats.mediumCount || 0}</span>
                      <span className="text-xs text-text-secondary ml-2">solved</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="bg-yellow-500 h-full" style={{ width: `${(stats.mediumCount / 10) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-dark-bg p-4 rounded-lg">
                    <div className="text-sm text-text-secondary mb-1">Hard</div>
                    <div className="flex items-end">
                      <span className="text-2xl font-bold text-red-500">{stats.hardCount || 0}</span>
                      <span className="text-xs text-text-secondary ml-2">solved</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full" style={{ width: `${(stats.hardCount / 10) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3 text-accent-pink">Recent Activity</h3>
                <div className="space-y-3">
                  {submissions.slice(0, 3).map(submission => (
                    <div key={submission.id} className="bg-dark-bg p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">{submission.problemName}</div>
                        <div className="text-sm text-text-secondary">{formatDate(submission.timestamp)}</div>
                      </div>
                      <div className={`${getStatusColor(submission.status)} font-medium`}>
                        {submission.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Rank and achievements */}
            <div>
              <div className="bg-dark-surface rounded-lg p-6 shadow-lg mb-6">
                <h2 className="text-xl font-semibold mb-4 text-primary-pink">Rank</h2>
                <div className="flex items-center justify-center py-6">
                  <div className="relative">
                    <svg className="w-32 h-32" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#444"
                        strokeWidth="1"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#FF4081"
                        strokeWidth="2"
                        strokeDasharray={`${(stats.points / 2000) * 100}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className="text-3xl font-bold">{stats.rank}</div>
                      <div className="text-sm text-text-secondary">{stats.points} pts</div>
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-text-secondary mt-2">
                  {2000 - stats.points} points until next rank
                </div>
              </div>
              
              <div className="bg-dark-surface rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-primary-pink">Achievements</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2 bg-dark-bg rounded-lg flex flex-col items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-green-900 flex items-center justify-center mb-1">
                      <span className="text-green-300 text-xs">{stats.streak}</span>
                    </div>
                    <div className="text-xs text-center text-text-secondary">Streak</div>
                  </div>
                  <div className="p-2 bg-dark-bg rounded-lg flex flex-col items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center mb-1">
                      <span className="text-blue-300 text-xs">{stats.solved}</span>
                    </div>
                    <div className="text-xs text-center text-text-secondary">Solved</div>
                  </div>
                  <div className="p-2 bg-dark-bg rounded-lg flex flex-col items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mb-1">
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <div className="text-xs text-center text-text-secondary">Locked</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'submissions' && (
          <div className="bg-dark-surface rounded-lg shadow-md p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4 text-primary-pink">Recent Submissions</h2>
            
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <p>No submissions yet. Start solving problems!</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-dark-bg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-pink uppercase tracking-wider">Problem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-pink uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-pink uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-pink uppercase tracking-wider">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-pink uppercase tracking-wider">Runtime</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-pink uppercase tracking-wider">Memory</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-pink uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody className="bg-dark-surface divide-y divide-gray-700">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-dark-bg transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{submission.problemName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs rounded ${submission.difficulty === 'Easy' ? 'bg-green-600' : submission.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'}`}>
                          {submission.difficulty || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={getStatusColor(submission.status)}>{submission.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{submission.language}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{submission.runtime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{submission.memory}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDate(submission.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {activeTab === 'badges' && (
          <div className="bg-dark-surface rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-primary-pink">Badges & Achievements</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Earned badges */}
              <div className="bg-dark-bg p-4 rounded-lg text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-primary-pink to-accent-pink flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-medium">First Blood</h3>
                <p className="text-xs text-text-secondary mt-1">Solved your first problem</p>
              </div>
              
              <div className="bg-dark-bg p-4 rounded-lg text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-primary-pink to-accent-pink flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </div>
                <h3 className="font-medium">Streak Master</h3>
                <p className="text-xs text-text-secondary mt-1">{stats.streak} day solving streak</p>
              </div>
              
              {/* Locked badges */}
              <div className="bg-dark-bg p-4 rounded-lg text-center opacity-50">
                <div className="h-16 w-16 mx-auto rounded-full bg-gray-700 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-500">Problem Solver</h3>
                <p className="text-xs text-gray-600 mt-1">Solve 25 problems</p>
              </div>
              
              <div className="bg-dark-bg p-4 rounded-lg text-center opacity-50">
                <div className="h-16 w-16 mx-auto rounded-full bg-gray-700 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-500">Contest Winner</h3>
                <p className="text-xs text-gray-600 mt-1">Win a coding contest</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;