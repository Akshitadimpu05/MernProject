import React from 'react';
import CodeEditor from "../CodeEditor";

const AddTwoNumbers = ({ problem, code, setCode, output, setOutput, handleRun, handleSubmit }) => {
  const testCases = [
    {
      id: '1',
      input: '[2, 4, 3], [5, 6, 4]',
      expected: '7 0 8'
    },
    {
      id: '2',
      input: '[0], [0]',
      expected: '0'
    },
    {
      id: '3',
      input: '[9,9,9,9,9,9,9], [9,9,9,9]',
      expected: '8 9 9 9 0 0 0 1'
    }
  ];
  
  return (
    <div className="space-y-4">
      <CodeEditor 
        code={code} 
        onChange={setCode} 
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

export default AddTwoNumbers;