import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';
import { submitContestSolution, runContestCode, getSubmissionStatus } from '../api/contestSubmissionApi';

// Language templates
const templates = {
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    // Your solution here
    
    return 0;
}`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Your solution here
        
    }
}`,
  python: `# Your solution here

`
};

// Map language to Ace Editor mode
const languageToMode = {
  cpp: 'c_cpp',
  java: 'java',
  python: 'python'
};

function ContestProblem() {
  const { contestId, problemId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  
  const [problem, setProblem] = useState(null);
  const [contest, setContest] = useState(null);
  const [code, setCode] = useState(templates.cpp);
  const [language, setLanguage] = useState('cpp');
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollInterval, setPollInterval] = useState(null);

  // Fetch problem and contest details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch problem details
        const problemResponse = await fetch(`/api/problems/${problemId}`);
        if (!problemResponse.ok) {
          throw new Error('Failed to fetch problem');
        }
        const problemData = await problemResponse.json();
        setProblem(problemData);
        
        // Fetch contest details
        const contestResponse = await fetch(`/api/contests/${contestId}`);
        if (!contestResponse.ok) {
          throw new Error('Failed to fetch contest');
        }
        const contestData = await contestResponse.json();
        setContest(contestData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [contestId, problemId]);

  // Change language and update code template
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setCode(templates[newLanguage]);
  };

  // Run code with custom input
  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setError(null);
      setOutput('Running code...');
      
      const result = await runContestCode(contestId, problemId, code, language, customInput);
      
      setOutput(result.output || 'No output');
      setIsRunning(false);
    } catch (err) {
      console.error('Error running code:', err);
      setError(err.message);
      setOutput('Error: ' + err.message);
      setIsRunning(false);
    }
  };

  // Submit solution
  const handleSubmitSolution = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setOutput('Submitting solution...');
      
      const result = await submitContestSolution(contestId, problemId, code, language);
      
      setSubmissionId(result.submissionId);
      setOutput('Submission received and is being processed. Submission ID: ' + result.submissionId);
      
      // Start polling for submission status
      const interval = setInterval(() => {
        pollSubmissionStatus(result.submissionId);
      }, 2000);
      
      setPollInterval(interval);
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error submitting solution:', err);
      setError(err.message);
      setOutput('Error: ' + err.message);
      setIsSubmitting(false);
    }
  };

  // Poll for submission status
  const pollSubmissionStatus = async (id) => {
    try {
      const status = await getSubmissionStatus(id);
      setSubmissionStatus(status);
      
      // If status is no longer pending, stop polling
      if (status.status !== 'pending') {
        clearInterval(pollInterval);
        setPollInterval(null);
        
        // Update output with submission result
        setOutput(`Status: ${status.status.toUpperCase()}
Execution Time: ${status.executionTime}ms
Memory Used: ${status.memoryUsed.toFixed(2)} MB

Output:
${status.output}`);
      }
    } catch (err) {
      console.error('Error polling submission status:', err);
      clearInterval(pollInterval);
      setPollInterval(null);
      setError('Failed to get submission status: ' + err.message);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

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
            onClick={() => navigate('/contests')} 
            className="mt-2 bg-primary-pink hover:bg-secondary-pink text-white px-4 py-2 rounded"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  if (!problem || !contest) {
    return (
      <div className="bg-dark-bg text-white p-8 min-h-screen">
        <p>Problem or contest not found</p>
        <button 
          onClick={() => navigate('/contests')} 
          className="mt-2 bg-primary-pink hover:bg-secondary-pink text-white px-4 py-2 rounded"
        >
          Back to Contests
        </button>
      </div>
    );
  }

  // Check if contest is active
  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);
  const isContestActive = now >= startTime && now <= endTime;

  return (
    <div className="bg-dark-bg text-white p-4 min-h-screen">
      {/* Contest info */}
      <div className="mb-4 p-4 bg-dark-surface rounded-lg">
        <h1 className="text-2xl font-bold text-[#FF4081] mb-2">{contest.title}</h1>
        <div className="flex justify-between items-center">
          <p className="text-sm text-[#B0B0B0]">
            {new Date(contest.startTime).toLocaleString()} - {new Date(contest.endTime).toLocaleString()}
          </p>
          <div className={`px-3 py-1 rounded-full text-sm ${isContestActive ? 'bg-green-600' : 'bg-red-600'}`}>
            {isContestActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Main content - split into two columns */}
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-180px)]">
        {/* Left column: Problem statement */}
        <div className="lg:w-1/2 bg-[#1E1E1E] p-6 rounded-lg overflow-y-auto">
          <h2 className="text-xl font-bold mb-2 text-[#FF4081]">{problem.title}</h2>
          <div className={`inline-block px-2 py-1 rounded text-xs mb-4 ${
            problem.difficulty === 'Easy' ? 'bg-green-600' : 
            problem.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
          }`}>
            {problem.difficulty}
          </div>
          <div className="mb-4 whitespace-pre-wrap">{problem.description}</div>
          
          {problem.constraints && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#FF4081] mb-2">Constraints</h3>
              <div className="whitespace-pre-wrap">{problem.constraints}</div>
            </div>
          )}
          
          {problem.testCases && problem.testCases.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#FF4081] mb-2">Examples</h3>
              {problem.testCases.map((testCase, index) => (
                <div key={index} className="mb-4 p-4 bg-[#121212] rounded-md">
                  <div className="mb-2">
                    <span className="font-semibold text-[#FF80AB]">Input:</span>
                    <pre className="mt-1 p-2 bg-[#1A1A1A] rounded overflow-x-auto">{testCase.input}</pre>
                  </div>
                  <div>
                    <span className="font-semibold text-[#FF80AB]">Output:</span>
                    <pre className="mt-1 p-2 bg-[#1A1A1A] rounded overflow-x-auto">{testCase.output}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right column: Code editor and output */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          {/* Code editor */}
          <div className="bg-[#1E1E1E] p-4 rounded-lg flex flex-col h-3/5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <label htmlFor="language" className="mr-2">Language:</label>
                <select
                  id="language"
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-[#121212] text-white border border-gray-700 rounded px-2 py-1"
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                </select>
              </div>
              <div>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || !isContestActive}
                  className={`mr-2 px-4 py-1 rounded ${
                    isRunning || !isContestActive ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isRunning ? 'Running...' : 'Run'}
                </button>
                <button
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting || !isContestActive}
                  className={`px-4 py-1 rounded ${
                    isSubmitting || !isContestActive ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#FF4081] hover:bg-[#F06292]'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
            
            <div className="border border-gray-700 rounded flex-grow">
              <AceEditor
                mode={languageToMode[language]}
                theme="monokai"
                name="code-editor"
                value={code}
                onChange={setCode}
                fontSize={14}
                width="100%"
                height="100%"
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true,
                  tabSize: 2,
                }}
              />
            </div>
          </div>
          
          {/* Custom input and output */}
          <div className="bg-[#1E1E1E] p-4 rounded-lg flex flex-col h-2/5">
            <div className="flex flex-col h-full">
              <div className="flex-1 mb-2">
                <h3 className="text-lg font-semibold mb-2 text-[#FF4081]">Custom Input</h3>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full h-[calc(100%-30px)] p-2 bg-[#121212] text-white border border-gray-700 rounded font-mono"
                  placeholder="Enter your custom input here..."
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-[#FF4081]">Output</h3>
                <pre className="w-full h-[calc(100%-30px)] p-2 bg-[#121212] text-white border border-gray-700 rounded font-mono overflow-auto">
                  {output || 'No output yet. Run your code to see results.'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contest inactive warning */}
      {!isContestActive && (
        <div className="mt-6 p-4 bg-red-900 rounded-lg">
          <p className="text-center">
            {now < startTime 
              ? 'This contest has not started yet.' 
              : 'This contest has ended. You can no longer submit solutions.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default ContestProblem;
