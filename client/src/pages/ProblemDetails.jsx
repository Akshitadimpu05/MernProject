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
      case "cpp":
        template = CppTemplates[problemId] || "";
        break;
      case "java":
        template = JavaTemplates[problemId] || "";
        break;
      case "python":
        template = PythonTemplates[problemId] || "";
        break;
      default:
        template = "";
    }
    setCode(template);
  };

  useEffect(() => {
    const currentProblem = problems.find(p => p.id === id);
    if (currentProblem) {
      // Check if this is a premium problem and user doesn't have premium access
      if (currentProblem.isPremium && (!user || !user.isPremium)) {
        navigate('/premium');
        return;
      }
      setProblem(currentProblem);
      updateCodeTemplate(id, language);
    } else {
      navigate('/problems');
    }
  }, [id, language, navigate, user]);

  const handleLogout = () => {
    auth.logout(() => navigate("/login"));
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    updateCodeTemplate(id, newLanguage);
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
      
      if (!res.ok) {
        const errorData = await res.json();
        setOutput(`Error: ${errorData.error || 'Something went wrong'}`);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      setOutput(data.output || 'No output');
      
    } catch (e) {
      console.error('Run error:', e);
      setOutput(`Runtime error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCustom = async () => {
    try {
      setLoading(true);
      setOutput("Running with custom input...");
      
      if (!customInput.trim()) {
        setOutput("Please provide custom input.");
        setLoading(false);
        return;
      }
      
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
        body: JSON.stringify({ 
          code, 
          language, 
          problemId: id,
          input: customInput
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        setOutput(`Error: ${errorData.error || 'Something went wrong'}`);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      setOutput(data.output || 'No output');
      
    } catch (e) {
      console.error('Run custom error:', e);
      setOutput(`Runtime error: ${e.message}`);
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
      console.log("Submission response:", data);
      
      if (res.ok) {
        setOutput(data.output || 'Submitted successfully!');
        if (data.analysis) {
          console.log("Setting analysis from submission:", data.analysis);
          setAnalysis(data.analysis);
          setShowAnalysis(true);
        }
      } else {
        setOutput(`Error: ${data.error}`);
      }
    } catch (e) {
      console.error("Submission error:", e);
      setOutput(`Submission error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      setOutput("Requesting AI analysis...");
      
      if (!code.trim()) {
        setOutput("Please write some code before requesting analysis.");
        setLoadingAnalysis(false);
        return;
      }
      
      const token = auth.getToken();
      if (!token) {
        setOutput("Authentication error: Not logged in.");
        setLoadingAnalysis(false);
        return;
      }
      
      console.log("Sending analysis request with:", { code: code.substring(0, 50) + "...", language, problemId: id });
      
      const res = await fetch(`/api/code/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code, language, problemId: id })
      });
      
      const data = await res.json();
      console.log("AI Analysis response:", data);
      
      if (res.ok && data.success) {
        // The server returns { success: true, analysis: { passed, complexity, suggestions } }
        setAnalysis(data.analysis);
        setShowAnalysis(true);
        setOutput("AI analysis completed successfully.");
      } else {
        setOutput(`AI Analysis error: ${data.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error("AI Analysis error:", e);
      setOutput(`AI Analysis error: ${e.message}`);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Function to show toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Toast-enhanced handlers
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

  // Request AI analysis of code
  const requestAnalysis = async () => {
    await handleGetAnalysis();
    setShowAnalysis(true);
  };

  // Render analysis panel
  const renderAnalysisPanel = () => {
    if (!analysis) return null;
    
    console.log("Rendering analysis panel with data:", analysis);
    
    return (
      <div className="fixed inset-0 bg-[#121212] bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#FF4081]">AI Code Analysis</h3>
            <button 
              onClick={() => setShowAnalysis(false)}
              className="text-[#B0B0B0] hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6 p-4 bg-[#121212] rounded-lg">
            <div className="mb-4">
              <p className="mb-2">
                <span className="text-[#FF80AB] font-semibold">Time Complexity:</span> {analysis.complexity?.timeComplexity || analysis.suggestions?.optimizedTimeComplexity || 'Unknown'}
              </p>
              <p>
                <span className="text-[#FF80AB] font-semibold">Space Complexity:</span> {analysis.complexity?.spaceComplexity || analysis.suggestions?.optimizedSpaceComplexity || 'Unknown'}
              </p>
            </div>
            <div className="mb-4 whitespace-pre-wrap text-[#B0B0B0]">
              {analysis.suggestions?.analysis || analysis.suggestions?.improvements || 'No analysis available'}
            </div>
          </div>
          
          {(analysis.suggestions?.optimizedCode || analysis.suggestions?.suggestions?.length > 0) && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-[#FF80AB]">Optimization Suggestions:</h4>
              {analysis.suggestions?.suggestions?.map((suggestion, index) => (
                <div key={index} className="mb-2 text-[#B0B0B0]">{suggestion}</div>
              ))}
              
              {analysis.suggestions?.optimizedCode && (
                <>
                  <h4 className="font-semibold my-2 text-[#FF80AB]">Optimized Code:</h4>
                  <pre className="bg-[#121212] text-white p-4 rounded-lg overflow-x-auto">{analysis.suggestions.optimizedCode}</pre>
                  <button
                    onClick={() => {
                      setCode(analysis.suggestions.optimizedCode);
                      setShowAnalysis(false);
                    }}
                    className="mt-4 px-4 py-2 bg-[#FF4081] hover:bg-[#F06292] text-white rounded transition-colors"
                  >
                    Use This Code
                  </button>
                </>
              )}
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

  return (
    <div className="h-screen bg-[#121212] text-white overflow-hidden flex flex-col">
      {/* Fixed header with problem title and language selector */}
      <div className="bg-[#1E1E1E] border-b border-gray-700 py-3 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#FF4081]">{problem.title}</h1>
            <div className="flex items-center mt-1">
              <span className={`px-2 py-0.5 text-xs rounded ${
                problem.difficulty === 'Easy' 
                  ? 'bg-[#4CAF50]' 
                  : problem.difficulty === 'Medium' 
                    ? 'bg-[#FFC107]' 
                    : 'bg-[#FF5252]'
              }`}>
                {problem.difficulty}
              </span>
            </div>
          </div>
          <div className="flex gap-4 items-center mt-4 md:mt-0">
            <select 
              value={language} 
              onChange={(e) => handleLanguageChange(e.target.value)} 
              className="bg-[#121212] text-white border border-gray-700 rounded px-3 py-1"
            >
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
            {user && <span className="text-[#B0B0B0]">👋 {user.username}</span>}
          </div>
        </div>
      </div>

      {/* Main content area with fixed height and two columns */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full flex flex-col lg:flex-row">
          {/* Left column: Problem description - scrollable */}
          <div className="w-full lg:w-2/5 h-full overflow-y-auto p-4 custom-scrollbar">
            <div className="bg-[#1E1E1E] p-6 rounded-lg h-full">
              <h2 className="text-xl font-semibold mb-4 text-[#FF4081]">Problem Description</h2>
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-[#B0B0B0]">{problem.description}</p>
                
                <h3 className="mt-6 font-semibold text-[#FF80AB]">Example</h3>
                <pre className="bg-[#121212] p-4 rounded-lg mt-2 overflow-x-auto">{problem.example}</pre>
                
                <h3 className="mt-6 font-semibold text-[#FF80AB]">Constraints</h3>
                <pre className="bg-[#121212] p-4 rounded-lg mt-2 overflow-x-auto">{problem.constraints || 'No specific constraints provided.'}</pre>
              </div>
              
              {/* AI Analysis button */}
              <button
                onClick={requestAnalysis}
                disabled={loadingAnalysis || !output}
                className="mt-6 w-full px-4 py-2 bg-[#F06292] hover:bg-[#FF4081] text-white rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center"
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

          {/* Right column: Split into code editor (top) and output/controls (bottom) */}
          <div className="w-full lg:w-3/5 h-full flex flex-col p-4">
            {/* Top half: Code editor */}
            <div className="h-1/2 bg-[#1E1E1E] p-4 rounded-lg mb-4 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#FF4081]">Solution</h2>
                <div className="text-sm text-[#B0B0B0]">{language === 'cpp' ? 'C++' : language === 'java' ? 'Java' : 'Python'}</div>
              </div>
              
              <div className="flex-1 overflow-hidden">
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
            </div>
            
            {/* Bottom half: Controls and output */}
            <div className="h-1/2 bg-[#1E1E1E] p-4 rounded-lg overflow-y-auto custom-scrollbar">
              {/* Custom input */}
              <div className="mb-4">
                <label className="block font-semibold mb-2 text-[#FF80AB]">Custom Input</label>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full h-20 p-3 bg-[#121212] border border-gray-700 rounded-lg text-white"
                  placeholder="e.g. [2,4,3], [5,6,4]"
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mb-4">
                <button 
                  onClick={handleRunBuiltInWithToast} 
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center disabled:bg-gray-700 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Running...' : '▶️ Run Code'}
                </button>
                <button 
                  onClick={handleRunCustomWithToast} 
                  disabled={loading || !customInput.trim()}
                  className="px-4 py-2 bg-[#FFC107] hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center disabled:bg-gray-700 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Running...' : '🧪 Custom Run'}
                </button>
                <button 
                  onClick={handleSubmitWithToast} 
                  disabled={loading}
                  className="px-4 py-2 bg-[#FF4081] hover:bg-[#F06292] text-white rounded-lg transition-colors flex items-center disabled:bg-gray-700 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Submitting...' : '✅ Submit'}
                </button>
              </div>

              {/* Output section */}
              <div>
                <h2 className="text-lg font-semibold mb-2 text-[#FF80AB]">Output</h2>
                <pre className="bg-[#121212] text-white p-4 rounded-lg overflow-x-auto min-h-[120px] max-h-[200px] overflow-y-auto shadow-inner">
                  {loading ? 'Processing...' : output || 'Run your code to see output here'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${toast.type === 'success' ? 'bg-[#4CAF50]' : 'bg-[#FF5252]'} text-white`}>
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}
      
      {/* AI Analysis modal */}
      {showAnalysis && renderAnalysisPanel()}
    </div>
  );
}

export default ProblemDetails;
