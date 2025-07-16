import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AceEditor from 'react-ace';

// Import ACE editor modes and themes
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

const ContestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

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

  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setOutput('');
    
    // Check if code is empty
    if (!code.trim()) {
      setOutput('Please write some code before running.');
      setIsRunning(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setOutput('Authentication error: Not logged in. Please log in again.');
        setIsRunning(false);
        return;
      }
      
      // Check if the code contains a main function for compiled languages
      if (language === 'cpp' && !code.includes('main(') && !code.includes('int main')) {
        setOutput('Error: Your C++ code must include a main() function.');
        setIsRunning(false);
        return;
      }
      
      if (language === 'java' && !code.includes('public static void main')) {
        setOutput('Error: Your Java code must include a public static void main(String[] args) method.');
        setIsRunning(false);
        return;
      }
      
      // Use the contest-specific endpoint for running code
      const { data } = await axios.post(`/api/contests/${id}/problems/${selectedProblem._id}/run`, {
        code,
        language,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setOutput(data.output || 'Code executed successfully but returned no output.');
    } catch (error) {
      console.error('Run code error:', error);
      if (error.response?.status === 401) {
        setOutput('Authentication error: Your session has expired. Please log in again.');
      } else {
        setOutput(error.response?.data?.error || 'An error occurred while executing your code. Make sure your code includes all necessary functions and a main method.');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setOutput('');
    try {
      // Use the contest-specific endpoint for submitting code
      const { data } = await axios.post(`/api/contests/${id}/problems/${selectedProblem._id}/submit`, {
        code,
        language,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Format submission results for display
      const results = data.results.map(res => 
        `Test Case ${res.testCaseId}: ${res.passed ? 'Passed' : 'Failed'}\nInput: ${res.input}\nOutput: ${res.output}\nExpected: ${res.expected}`
      ).join('\n\n');
      setOutput(`Submission Status: ${data.status}\n\n${results}`);
    } catch (error) {
      setOutput(error.response?.data?.error || 'An error occurred during submission.');
    } finally {
      setIsRunning(false);
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

        {/* Right Panel: Problem Details and Editor */}
        <div className="w-3/4 flex flex-col p-4">
          {selectedProblem ? (
            <>
              <div className="flex-grow flex flex-col">
                <h2 className="text-2xl font-bold">{selectedProblem.title}</h2>
                <p className="text-gray-400">Difficulty: {selectedProblem.difficulty}</p>
                <p className="my-4 whitespace-pre-wrap">{selectedProblem.statement}</p>
                
                <div className="flex items-center mb-2">
                  <label htmlFor="language" className="mr-2">Language:</label>
                  <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className="bg-gray-700 p-2 rounded">
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                  </select>
                </div>

                <AceEditor
                  mode={language === 'cpp' ? 'c_cpp' : language}
                  theme="monokai"
                  onChange={setCode}
                  name="code-editor"
                  editorProps={{ $blockScrolling: true }}
                  value={code}
                  width="100%"
                  height="400px"
                  fontSize={16}
                />

                <div className="mt-4 flex space-x-4">
                  <button 
                    onClick={() => navigate(`/contests/${id}/problems/${selectedProblem._id}/solve`)} 
                    disabled={!isEnrolled || (contestStatus !== 'active')} 
                    className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded disabled:bg-gray-500"
                    title={!isEnrolled ? 'You must enroll in the contest first' : contestStatus !== 'active' ? 'Contest is not active' : ''}
                  >
                    Solve Problem
                  </button>
                  <button 
                    onClick={handleRunCode} 
                    disabled={isRunning || (contestStatus !== 'active')} 
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:bg-gray-500"
                    title={contestStatus !== 'active' ? 'Contest is not active' : ''}
                  >
                    {isRunning ? 'Running...' : 'Run Code'}
                  </button>
                  <button 
                    onClick={handleSubmitCode} 
                    disabled={isRunning || !canParticipate} 
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded disabled:bg-gray-500"
                    title={!canParticipate ? 'You must be enrolled in an active contest to submit' : ''}
                  >
                    {isRunning ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
                
                {!canParticipate && contestStatus === 'active' && (
                  <div className="mt-2 text-yellow-500 text-sm">
                    You must be enrolled to submit solutions in this contest.
                  </div>
                )}

                <div className="mt-4 flex-grow bg-gray-900 p-4 rounded overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-2">Output</h3>
                  <pre className="whitespace-pre-wrap">{output}</pre>
                </div>
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
