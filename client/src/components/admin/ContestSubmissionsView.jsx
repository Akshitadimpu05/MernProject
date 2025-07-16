import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContestSubmissions } from '../../api/contestSubmissionApi';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

// Map language to Ace Editor mode
const languageToMode = {
  cpp: 'c_cpp',
  java: 'java',
  python: 'python'
};

// Status badge color mapping
const statusColors = {
  pending: 'bg-yellow-600',
  accepted: 'bg-green-600',
  wrong_answer: 'bg-red-600',
  time_limit_exceeded: 'bg-orange-600',
  memory_limit_exceeded: 'bg-orange-600',
  runtime_error: 'bg-red-600',
  compilation_error: 'bg-red-600'
};

function ContestSubmissionsView() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  
  const [contest, setContest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [viewCode, setViewCode] = useState(false);
  
  // Fetch contest details and submissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch contest details
        const contestResponse = await fetch(`/api/contests/${contestId}`);
        if (!contestResponse.ok) {
          throw new Error('Failed to fetch contest');
        }
        const contestData = await contestResponse.json();
        setContest(contestData);
        
        // Fetch contest submissions
        const submissionsData = await getContestSubmissions(contestId);
        setSubmissions(submissionsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [contestId]);

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format status for display
  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  // Handle view code button click
  const handleViewCode = (submission) => {
    setSelectedSubmission(submission);
    setViewCode(true);
  };

  // Close code view modal
  const closeCodeView = () => {
    setViewCode(false);
    setSelectedSubmission(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark-bg">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-pink"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-bg text-white p-8 min-h-screen">
        <div className="bg-red-900 text-white p-4 rounded-md mb-4">
          <p>Error: {error}</p>
          <button 
            onClick={() => navigate('/admin/contests')} 
            className="mt-2 bg-primary-pink hover:bg-secondary-pink text-white px-4 py-2 rounded"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="bg-dark-bg text-white p-8 min-h-screen">
        <p>Contest not found</p>
        <button 
          onClick={() => navigate('/admin/contests')} 
          className="mt-2 bg-primary-pink hover:bg-secondary-pink text-white px-4 py-2 rounded"
        >
          Back to Contests
        </button>
      </div>
    );
  }

  return (
    <div className="bg-dark-bg text-white p-6 min-h-screen">
      {/* Contest info */}
      <div className="mb-6 p-4 bg-dark-surface rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-pink">{contest.title} - Submissions</h1>
          <button 
            onClick={() => navigate('/admin/contests')} 
            className="bg-primary-pink hover:bg-secondary-pink text-white px-4 py-2 rounded"
          >
            Back to Contests
          </button>
        </div>
        <p className="text-sm text-text-secondary mt-2">
          {new Date(contest.startTime).toLocaleString()} - {new Date(contest.endTime).toLocaleString()}
        </p>
      </div>

      {/* Submissions table */}
      <div className="bg-dark-surface rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">All Submissions ({submissions.length})</h2>
        </div>
        
        {submissions.length === 0 ? (
          <div className="p-6 text-center text-text-secondary">
            No submissions found for this contest.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-bg">
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Problem</th>
                  <th className="px-4 py-3 text-left">Language</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Runtime</th>
                  <th className="px-4 py-3 text-left">Memory</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission._id} className="border-t border-gray-700 hover:bg-dark-bg">
                    <td className="px-4 py-3">{submission.userId?.username || 'Unknown'}</td>
                    <td className="px-4 py-3">{submission.problemId?.title || 'Unknown'}</td>
                    <td className="px-4 py-3 uppercase">{submission.language}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[submission.status] || 'bg-gray-600'}`}>
                        {formatStatus(submission.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{submission.executionTime} ms</td>
                    <td className="px-4 py-3">{submission.memoryUsed?.toFixed(2) || 0} MB</td>
                    <td className="px-4 py-3">{formatDate(submission.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewCode(submission)}
                        className="bg-primary-pink hover:bg-secondary-pink text-white px-3 py-1 rounded text-sm"
                      >
                        View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Code view modal */}
      {viewCode && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Submission by {selectedSubmission.userId?.username || 'Unknown'} - {selectedSubmission.problemId?.title || 'Unknown'}
              </h3>
              <button
                onClick={closeCodeView}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 flex-grow overflow-auto">
              <div className="mb-4 grid grid-cols-3 gap-4">
                <div>
                  <span className="text-text-secondary">Language:</span>
                  <span className="ml-2 uppercase">{selectedSubmission.language}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${statusColors[selectedSubmission.status] || 'bg-gray-600'}`}>
                    {formatStatus(selectedSubmission.status)}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">Submitted:</span>
                  <span className="ml-2">{formatDate(selectedSubmission.createdAt)}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">Code</h4>
                <div className="border border-gray-700 rounded">
                  <AceEditor
                    mode={languageToMode[selectedSubmission.language]}
                    theme="monokai"
                    name="code-viewer"
                    value={selectedSubmission.code}
                    readOnly={true}
                    fontSize={14}
                    width="100%"
                    height="300px"
                    showPrintMargin={false}
                    showGutter={true}
                    highlightActiveLine={false}
                    setOptions={{
                      showLineNumbers: true,
                      tabSize: 2,
                    }}
                  />
                </div>
              </div>
              
              {selectedSubmission.output && (
                <div>
                  <h4 className="text-md font-semibold mb-2">Output</h4>
                  <pre className="p-3 bg-dark-bg border border-gray-700 rounded overflow-auto max-h-40">
                    {selectedSubmission.output}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={closeCodeView}
                className="bg-primary-pink hover:bg-secondary-pink text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContestSubmissionsView;
