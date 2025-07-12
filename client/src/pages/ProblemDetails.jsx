import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../redux/slices/userSlice';
import { auth } from "../auth/auth.js";
import { problems } from '../data/problems';
import TwoSum from "../components/problems/TwoSum";
import AddTwoNumbers from "../components/problems/AddTwoNumbers";
import LongestSubstring from "../components/problems/LongestSubstring";
import ValidPalindrome from "../components/problems/ValidPalindrome";
import ValidAnagram from "../components/problems/ValidAnagram";
import ReverseString from "../components/problems/ReverseString";
import PalindromeNumber from "../components/problems/PalindromeNumber";
import Permutations from "../components/problems/Permutations";
import CodeEditor from '../components/CodeEditor';

import CppTemplates from '../templates/CppTemplates';
import JavaTemplates from '../templates/JavaTemplates';
import PythonTemplates from '../templates/PythonTemplates';

function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated, token } = useSelector(state => state.user);

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [loading, setLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);

  const updateCodeTemplate = (problemId, lang) => {
    let template;
    switch (lang) {
      case 'java':
        template = JavaTemplates[problemId] || JavaTemplates.default(problem?.title || '', problem?.functionSignature || '');
        break;
      case 'python':
        template = PythonTemplates[problemId] || PythonTemplates.default(problem?.title || '', problem?.functionSignature || '');
        break;
      case 'cpp':
      default:
        template = CppTemplates[problemId] || CppTemplates.default(problem?.title || '', problem?.functionSignature || '');
        break;
    }
    setCode(template);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    updateCodeTemplate(id, newLang);
    setAnalysis(null);
    setShowAnalysis(false);
  };

  useEffect(() => {
    const currentProblem = problems.find(p => p.id === id);
    if (currentProblem) {
      setProblem(currentProblem);
      updateCodeTemplate(id, language);
    } else {
      navigate('/problems');
    }
  }, [id, navigate]);

  const handleLogout = () => {
    auth.logout(() => navigate("/login"));
  };

  const handleRunBuiltIn = async () => {
    try {
      setLoading(true);
      setOutput("Running with built-in test case...");
      if (!token) {
        setOutput("Authentication error: Not logged in.");
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/code/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code, language, problemId: id })
      });
      const data = await res.json();
      setOutput(data.output || `Error: ${data.error}`);
    } catch (e) {
      setOutput(`Execution error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCustom = async () => {
    try {
      setLoading(true);
      setOutput("Running with custom input...");
      if (!token) {
        setOutput("Authentication error: Not logged in.");
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/code/custom-run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code, language, problemId: id, input: customInput })
      });
      const data = await res.json();
      setOutput(data.output || `Error: ${data.error}`);
    } catch (e) {
      setOutput(`Execution error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setOutput("Submitting solution...");
      if (!token) {
        setOutput("Authentication error: Not logged in.");
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/code/submit?analyze=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ problemId: id, code, language })
      });
      const data = await res.json();
      if (res.ok) {
        setOutput(data.output || 'Submitted successfully!');
        if (data.analysis) {
          setAnalysis(data.analysis);
          setShowAnalysis(true);
        }
      } else {
        setOutput(`Error: ${data.error}`);
      }
    } catch (e) {
      setOutput(`Submission error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const requestAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      const token = auth.getToken();
      const res = await fetch(`/api/code/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code, language, problemId: id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalysis(data.analysis);
        setShowAnalysis(true);
      } else {
        setOutput(`AI Analysis error: ${data.error}`);
      }
    } catch (e) {
      setOutput(`AI Analysis error: ${e.message}`);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const renderAnalysisPanel = () => {
    if (!analysis) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-dark-surface p-6 rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-primary-pink">AI Code Analysis</h3>
            <button 
              onClick={() => setShowAnalysis(false)}
              className="text-text-secondary hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6 p-4 bg-dark-bg rounded-lg">
            <div className="mb-4">
              <p className="mb-2"><span className="text-accent-pink font-semibold">Time Complexity:</span> {analysis.complexity?.timeComplexity}</p>
              <p><span className="text-accent-pink font-semibold">Space Complexity:</span> {analysis.complexity?.spaceComplexity}</p>
            </div>
            <div className="mb-4 whitespace-pre-wrap text-text-secondary">{analysis.suggestions?.analysis}</div>
          </div>
          
          {analysis.suggestions?.optimizedCode && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-accent-pink">Optimized Code:</h4>
              <pre className="bg-dark-bg text-white p-4 rounded-lg overflow-x-auto">{analysis.suggestions.optimizedCode}</pre>
              <button
                onClick={() => {
                  setCode(analysis.suggestions.optimizedCode);
                  setShowAnalysis(false);
                }}
                className="mt-4 px-4 py-2 bg-primary-pink hover:bg-secondary-pink text-white rounded transition-colors"
              >
                Use This Code
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!problem) return <div>Loading...</div>;

  const ProblemComponent = {
    '1': TwoSum,
    '2': AddTwoNumbers,
    '3': LongestSubstring,
    '4': ValidAnagram,
    '5': ReverseString,
    '6': ValidPalindrome,
    '7': PalindromeNumber,
    '8': Permutations
  }[id];

  if (!ProblemComponent) return <div>Problem not found</div>;

  // Toast notification component for run/submit feedback
  const Toast = ({ message, type }) => {
    return (
      <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        <div className="flex items-center">
          {type === 'success' ? (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {message}
        </div>
      </div>
    );
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Create toast-enhanced handlers
  const handleRunBuiltInWithToast = async () => {
    await handleRunBuiltIn();
    showToast('Code executed successfully', 'success');
  };

  const handleRunCustomWithToast = async () => {
    await handleRunCustom();
    showToast('Custom test executed successfully', 'success');
  };

  const handleSubmitWithToast = async () => {
    await handleSubmit();
    showToast('Solution submitted successfully', 'success');
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="container mx-auto p-4">
        {/* Header with problem title and language selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-pink">{problem.title}</h1>
            <div className="flex items-center mt-1">
              <span className={`px-2 py-0.5 text-xs rounded ${problem.difficulty === 'Easy' ? 'bg-green-600' : problem.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'}`}>
                {problem.difficulty}
              </span>
            </div>
          </div>
          <div className="flex gap-4 items-center mt-4 md:mt-0">
            <select 
              value={language} 
              onChange={(e) => handleLanguageChange(e.target.value)} 
              className="bg-dark-surface text-white border border-gray-700 rounded px-3 py-1"
            >
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
            {user && <span className="text-text-secondary">👋 {user.username}</span>}
          </div>
        </div>

        {/* Main content area with two columns */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: Problem description */}
          <div className="w-full lg:w-2/5 order-2 lg:order-1">
            <div className="bg-dark-surface p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-primary-pink">Problem Description</h2>
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-text-secondary">{problem.description}</p>
                
                <h3 className="mt-6 font-semibold text-accent-pink">Example</h3>
                <pre className="bg-dark-bg p-4 rounded-lg mt-2 overflow-x-auto">{problem.example}</pre>
                
                <h3 className="mt-6 font-semibold text-accent-pink">Constraints</h3>
                <pre className="bg-dark-bg p-4 rounded-lg mt-2 overflow-x-auto">{problem.constraints || 'No specific constraints provided.'}</pre>
              </div>
              
              {/* AI Analysis button */}
              <button
                onClick={requestAnalysis}
                disabled={loadingAnalysis || !output}
                className="mt-6 w-full px-4 py-2 bg-secondary-pink hover:bg-primary-pink text-white rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loadingAnalysis ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>AI Code Analysis</>  
                )}
              </button>
            </div>
          </div>

          {/* Right column: Code editor and output */}
          <div className="w-full lg:w-3/5 order-1 lg:order-2">
            <div className="bg-dark-surface p-6 rounded-lg">
              {/* Code editor component */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-primary-pink">Solution</h2>
                  <div className="text-sm text-text-secondary">{language === 'cpp' ? 'C++' : language === 'java' ? 'Java' : 'Python'}</div>
                </div>
                
                <ProblemComponent
                  problem={problem}
                  code={code}
                  setCode={setCode}
                  language={language}
                  handleRunBuiltIn={handleRunBuiltIn}
                  handleRunCustom={handleRunCustom}
                  customInput={customInput}
                  setCustomInput={setCustomInput}
                  output={output}
                  loading={loading}
                />
              </div>

              {/* Action buttons and custom input in a scrollable container */}
              <div className="max-h-[calc(100vh-500px)] overflow-y-auto pr-2 custom-scrollbar">
                <div className="mb-4">
                  <label className="block font-semibold mb-2 text-accent-pink">Custom Input</label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full h-24 p-3 bg-dark-bg border border-gray-700 rounded-lg text-white"
                    placeholder="e.g. [2,4,3], [5,6,4]"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handleRunBuiltInWithToast} 
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center disabled:bg-gray-700 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Running...' : '▶️ Run Code'}
                  </button>
                  <button 
                    onClick={handleRunCustomWithToast} 
                    disabled={loading || !customInput.trim()}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center disabled:bg-gray-700 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Running...' : '🧪 Custom Run'}
                  </button>
                  <button 
                    onClick={handleSubmitWithToast} 
                    disabled={loading}
                    className="px-4 py-2 bg-primary-pink hover:bg-secondary-pink text-white rounded-lg transition-colors flex items-center disabled:bg-gray-700 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : '✅ Submit'}
                  </button>
                </div>

                {/* Output section */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2 text-accent-pink">Output</h2>
                  <pre className="bg-dark-bg text-white p-4 rounded-lg overflow-x-auto min-h-[100px] max-h-[300px] overflow-y-auto">
                    {loading ? 'Processing...' : output || 'Run your code to see output here'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}
      
      {/* AI Analysis modal */}
      {showAnalysis && renderAnalysisPanel()}
    </div>
  );
}

export default ProblemDetails;