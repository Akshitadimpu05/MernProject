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
        setCode={setCode} 
        output={output}
        setOutput={setOutput}
        handleRun={handleRun}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default AddTwoNumbers;