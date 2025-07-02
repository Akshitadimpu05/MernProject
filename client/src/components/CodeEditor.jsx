import { useState } from "react";
import axios from "axios";

const CodeEditor = () => {
  const [code, setCode] = useState(`#include<iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}`);
  const [output, setOutput] = useState("");

  const handleRun = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/code/run", {
        language: "cpp",
        code: code,
      });
      setOutput(response.data.output);
    } catch (err) {
      setOutput(err.response?.data?.error || "Error running code");
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows="15"
        className="w-full p-4 border rounded font-mono"
      ></textarea>
      <button
        onClick={handleRun}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Run Code
      </button>
      <div className="mt-4 p-4 bg-gray-100 rounded border">
        <strong>Output:</strong>
        <pre className="mt-2">{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;
