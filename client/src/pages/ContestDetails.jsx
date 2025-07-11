import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AceEditor from 'react-ace';

// Import ACE editor modes and themes
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

const ContestDetails = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const { data } = await axios.get(`/api/contests/${id}`);
        setContest(data);
        if (data.problems.length > 0) {
          setSelectedProblem(data.problems[0]);
        }
      } catch (error) {
        console.error('Error fetching contest details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [id]);

  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setOutput('');
    try {
      const { data } = await axios.post('/api/code/run', {
        problemId: selectedProblem._id,
        code,
        language,
      });
      setOutput(data.output);
    } catch (error) {
      setOutput(error.response?.data?.error || 'An error occurred.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setOutput('');
    try {
      const { data } = await axios.post('/api/code/submit', {
        problemId: selectedProblem._id,
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

  return (
    <div className="flex h-[calc(100vh-64px)] text-white bg-[#1A1A1D]">
      {/* Left Panel: Problems List */}
      <div className="w-1/4 p-4 overflow-y-auto border-r border-gray-700">
        <h2 className="text-2xl font-bold mb-4">{contest.title}</h2>
        <h3 className="text-xl font-semibold mb-3">Problems</h3>
        <ul>
          {contest.problems.map(problem => (
            <li key={problem._id} 
                className={`p-2 rounded cursor-pointer ${selectedProblem?._id === problem._id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                onClick={() => setSelectedProblem(problem)}>
              {problem.title}
            </li>
          ))}
        </ul>
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
                <button onClick={handleRunCode} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:bg-gray-500">
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
                <button onClick={handleSubmitCode} disabled={isRunning} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded disabled:bg-gray-500">
                  {isRunning ? 'Submitting...' : 'Submit'}
                </button>
              </div>

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
  );
};

export default ContestDetails;
