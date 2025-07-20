import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ContestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [contestStatus, setContestStatus] = useState('upcoming'); // 'upcoming', 'active', 'ended'

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const { data } = await axios.get(`/api/contests/${id}`);
        setContest(data);
        
        // Check if contest has problems and set the first one as selected
        if (data.problems && data.problems.length > 0) {
          setSelectedProblem(data.problems[0]);
        }
        
        // Check if user is enrolled
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const userResponse = await axios.get('/api/auth/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const userId = userResponse.data._id;
            setIsEnrolled(data.enrolledUsers.includes(userId));
          } catch (error) {
            console.error('Error checking enrollment status:', error);
          }
        }
        
        // Determine contest status
        const now = new Date();
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        
        if (now < startTime) {
          setContestStatus('upcoming');
        } else if (now >= startTime && now <= endTime) {
          setContestStatus('active');
        } else {
          setContestStatus('ended');
        }
      } catch (error) {
        console.error('Error fetching contest details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [id]);
  
  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to enroll in this contest.');
        return;
      }
      
      await axios.post(`/api/contests/${id}/enroll`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setIsEnrolled(true);
      alert('Enrolled successfully!');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message === 'Already enrolled in this contest') {
        setIsEnrolled(true); // Update UI to show enrolled status
        alert('You are already enrolled in this contest.');
      } else {
        alert(error.response?.data?.message || 'Failed to enroll in the contest.');
      }
    }
  };

  if (loading) return <div className="text-white text-center p-10">Loading contest...</div>;
  if (!contest) return <div className="text-white text-center p-10">Contest not found.</div>;

  // Format contest times
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Determine if user can participate
  const canParticipate = isEnrolled && contestStatus === 'active';
  
  // Get status badge color
  const getStatusBadgeColor = () => {
    switch(contestStatus) {
      case 'upcoming': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'ended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] text-white bg-[#1A1A1D]">
      {/* Contest Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{contest.title}</h2>
          <span className={`${getStatusBadgeColor()} px-3 py-1 rounded-full text-sm font-medium`}>
            {contestStatus.charAt(0).toUpperCase() + contestStatus.slice(1)}
          </span>
        </div>
        <p className="mt-2">{contest.description}</p>
        <div className="mt-2 flex flex-wrap gap-4">
          <p><strong>Starts:</strong> {formatDate(contest.startTime)}</p>
          <p><strong>Ends:</strong> {formatDate(contest.endTime)}</p>
        </div>
        
        {!isEnrolled && contestStatus === 'active' && (
          <button 
            onClick={handleEnroll}
            className="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            Enroll in Contest
          </button>
        )}
        
        {!canParticipate && contestStatus === 'active' && (
          <div className="mt-3 bg-yellow-800 text-yellow-200 p-2 rounded">
            You must enroll to participate in this contest.
          </div>
        )}
        
        {contestStatus === 'upcoming' && (
          <div className="mt-3 bg-blue-800 text-blue-200 p-2 rounded">
            This contest hasn't started yet. Check back at {formatDate(contest.startTime)}.
          </div>
        )}
        
        {contestStatus === 'ended' && (
          <div className="mt-3 bg-gray-800 text-gray-200 p-2 rounded">
            This contest has ended. You can still view the problems but cannot submit solutions.
          </div>
        )}
      </div>

      {/* Contest Rules */}
      <div className="p-4 bg-gray-800 mx-4 my-3 rounded">
        <h3 className="text-xl font-semibold mb-2">Contest Rules</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>All submissions are checked for plagiarism. Copying code from other participants will result in disqualification.</li>
          <li>Each problem must be solved within the given time and memory constraints.</li>
          <li>You may submit multiple solutions to the same problem, but only your highest-scoring submission will be counted.</li>
          <li>Internet access is permitted for reference purposes only, not for seeking direct help with problems.</li>
          <li>Any form of communication with other participants during the contest is prohibited.</li>
          <li>The judge's decision is final in all matters related to scoring and ranking.</li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Problems List */}
        <div className="w-1/4 p-4 overflow-y-auto border-r border-gray-700">
          <h3 className="text-xl font-semibold mb-3">Problems</h3>
          {contest.problems && contest.problems.length > 0 ? (
            <ul>
              {contest.problems.map(problem => (
                <li key={problem._id} 
                    className={`p-2 rounded cursor-pointer ${selectedProblem?._id === problem._id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                    onClick={() => setSelectedProblem(problem)}>
                  {problem.title} <span className="text-xs text-gray-400">({problem.difficulty})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No problems available for this contest.</p>
          )}
        </div>

        {/* Right Panel: Problem Details */}
        <div className="w-3/4 flex flex-col p-4">
          {selectedProblem ? (
            <>
              <div className="flex-grow flex flex-col">
                <h2 className="text-2xl font-bold">{selectedProblem.title}</h2>
                <p className="text-gray-400">Difficulty: {selectedProblem.difficulty}</p>
                <p className="my-4 whitespace-pre-wrap">{selectedProblem.statement}</p>
                
                <div className="mt-4 flex space-x-4">
                  <button 
                    onClick={() => navigate(`/contests/${id}/problems/${selectedProblem._id}/solve`)} 
                    disabled={!isEnrolled || (contestStatus !== 'active')} 
                    className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded disabled:bg-gray-500"
                    title={!isEnrolled ? 'You must enroll in the contest first' : contestStatus !== 'active' ? 'Contest is not active' : ''}
                  >
                    Solve Problem
                  </button>
                </div>
                
                {!canParticipate && contestStatus === 'active' && (
                  <div className="mt-2 text-yellow-500 text-sm">
                    You must be enrolled to solve problems in this contest.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Select a problem to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestDetails;