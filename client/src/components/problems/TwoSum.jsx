import React from 'react';
import CodeEditor from "../CodeEditor";

const TwoSum = ({ problem, code, setCode, output, setOutput, handleRun, handleSubmit }) => {
  const testCases = [
    {
      id: '1',
      input: '[2, 7, 11, 15], 9',
      expected: '0 1'
    },
    {
      id: '2',
      input: '[3, 2, 4], 6',
      expected: '1 2'
    },
    {
      id: '3',
      input: '[3, 3], 6',
      expected: '0 1'
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

export default TwoSum;