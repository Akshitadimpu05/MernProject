import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { problems } from '../data/problems';
import TwoSum from "../components/problems/TwoSum";
import AddTwoNumbers from "../components/problems/AddTwoNumbers";

import CppTemplates from '../templates/CppTemplates';
import JavaTemplates from '../templates/JavaTemplates';
import PythonTemplates from '../templates/PythonTemplates';

function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [loading, setLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");

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

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    updateCodeTemplate(id, newLanguage);
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

  const handleRunBuiltIn = async () => {
    try {
      setLoading(true);
      setOutput("Running with built-in test case...");
      const response = await fetch('/api/code/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code,
          language,
          problemId: id
          // ❌ No input sent → backend uses built-in test
        })
      });
      const data = await response.json();
      if (data.error) {
        setOutput(`Error: ${data.error}`);
        return;
      }
      setOutput(data.output);
    } catch (error) {
      console.error('Error executing built-in run:', error);
      setOutput('Error executing built-in run');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCustom = async () => {
    try {
      setLoading(true);
      setOutput("Running with custom input...");
      const response = await fetch('/api/code/custom-run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code,
          language,
          problemId: id,
          input: customInput // ✅ custom input is passed
        })
      });
      const data = await response.json();
      if (data.error) {
        setOutput(`Error: ${data.error}`);
        return;
      }
      setOutput(data.output);
    } catch (error) {
      console.error('Error executing custom input run:', error);
      setOutput('Error executing custom input run');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setOutput("Submitting solution...");
      const response = await fetch('/api/code/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          problemId: id,
          code,
          language
        })
      });
      const data = await response.json();
      if (data.success) {
        setOutput(data.output || "Solution submitted successfully!");
      } else {
        setOutput(`Error: ${data.error || "Submission failed"}`);
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      setOutput('Error submitting solution');
    } finally {
      setLoading(false);
    }
  };

  if (!problem) return <div>Loading...</div>;

  const ProblemComponent = {
    '1': TwoSum,
    '2': AddTwoNumbers
  }[id];

  if (!ProblemComponent) {
    return <div>Problem component not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Problem Description</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p>{problem.description}</p>
            <h3 className="mt-4 font-semibold">Example:</h3>
            <pre className="mt-2 bg-gray-200 p-4 rounded">{problem.example}</pre>
          </div>
        </div>

        <div>
          <ProblemComponent
            problem={problem}
            code={code}
            setCode={setCode}
            output={output}
            setOutput={setOutput}
            handleRun={handleRunBuiltIn}
            handleSubmit={handleSubmit}
          />

          {/* Custom Input Section */}
          <div className="mt-4">
            <label className="block font-semibold mb-2">Custom Input (stdin):</label>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-full h-24 p-2 border border-gray-300 rounded"
              placeholder="Enter custom input like: {2, 7, 11, 15}, 9"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <button
              onClick={handleRunBuiltIn}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              ▶️ Run Built-in Test Case
            </button>

            <button
              onClick={handleRunCustom}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              🧪 Run with Custom Input
            </button>

            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              ✅ Submit Solution
            </button>
          </div>

          {loading && <div className="mt-4 text-blue-600">Processing...</div>}

          {/* Output */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Output:</h2>
            <pre className="bg-gray-900 text-white p-4 rounded">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemDetails;
