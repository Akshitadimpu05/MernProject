import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../redux/slices/userSlice';
import { auth } from "../auth/auth.js";
import { problems } from '../data/problems';
import TwoSum from "../components/problems/TwoSum";
import AddTwoNumbers from "../components/problems/AddTwoNumbers";
import CodeEditor from '../components/CodeEditor';

import CppTemplates from '../templates/CppTemplates';
import JavaTemplates from '../templates/JavaTemplates';
import PythonTemplates from '../templates/PythonTemplates';

function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector(state => state.user);

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [loading, setLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

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
      const token = auth.getToken();
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
      const token = auth.getToken();
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
      const token = auth.getToken();
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
      <div className="mt-8 bg-white p-4 rounded shadow">
        <h3 className="text-xl font-bold text-indigo-700 mb-4">AI Code Analysis</h3>
        <div className="mb-4">
          <p><strong>Time Complexity:</strong> {analysis.complexity?.timeComplexity}</p>
          <p><strong>Space Complexity:</strong> {analysis.complexity?.spaceComplexity}</p>
        </div>
        <div className="mb-4 whitespace-pre-wrap">{analysis.suggestions?.analysis}</div>
        {analysis.suggestions?.optimizedCode && (
          <>
            <h4 className="font-semibold mt-4">Optimized Code:</h4>
            <pre className="bg-gray-800 text-white p-4 rounded">{analysis.suggestions.optimizedCode}</pre>
            <button
              onClick={() => {
                setCode(analysis.suggestions.optimizedCode);
                setShowAnalysis(false);
              }}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded"
            >
              Use This Code
            </button>
          </>
        )}
      </div>
    );
  };

  if (!problem) return <div>Loading...</div>;

  const ProblemComponent = {
    '1': TwoSum,
    '2': AddTwoNumbers
  }[id];

  if (!ProblemComponent) return <div>Problem not found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <div className="flex gap-4 items-center">
          <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="border rounded px-3 py-1">
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>
          {user && <span>👋 {user.username}</span>}
          <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="whitespace-pre-wrap">{problem.description}</p>
            <h3 className="mt-4 font-semibold">Example</h3>
            <pre className="bg-gray-200 p-4 rounded mt-2">{problem.example}</pre>
          </div>
        </div>

        <div>
          <ProblemComponent
            problem={problem}
            code={code}
            setCode={setCode}
          />

          <div className="mt-4">
            <label className="block font-semibold mb-2">Custom Input</label>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-full h-24 p-2 border rounded"
              placeholder="e.g. [2,4,3], [5,6,4]"
            />
          </div>

          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <button onClick={handleRunBuiltIn} className="bg-blue-500 text-white px-4 py-2 rounded">▶️ Built-in Run</button>
            <button onClick={handleRunCustom} className="bg-yellow-500 text-white px-4 py-2 rounded">🧪 Custom Run</button>
            <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">✅ Submit</button>
          </div>

          {loading && <div className="mt-4 text-blue-600">Processing...</div>}

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Output</h2>
            <pre className="bg-gray-900 text-white p-4 rounded">{output}</pre>
          </div>

          {!loading && !loadingAnalysis && output && !showAnalysis && (
            <button
              onClick={requestAnalysis}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
            >
              Get AI Optimization Suggestions
            </button>
          )}
        </div>
      </div>

      {showAnalysis && renderAnalysisPanel()}
    </div>
  );
}

export default ProblemDetails;
