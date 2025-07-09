import React from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ code, setCode, output, setOutput, handleRun, handleSubmit }) => {
  // Map language from file extension or explicitly set language
  const getEditorLanguage = () => {
    if (code.includes('class Solution:') || code.startsWith('#')) {
      return 'python';
    } else if (code.includes('public class') || code.includes('class Solution {')) {
      return 'java';
    } else {
      return 'cpp';
    }
  };

  return (
    <div className="space-y-4">
      <Editor
        height="60vh"
        language={getEditorLanguage()}
        value={code}
        onChange={setCode}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: "on",
          theme: "vs-dark"
        }}
      />
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleRun}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Run
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Submit
        </button>
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded border">
        <pre className="text-gray-800 whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;