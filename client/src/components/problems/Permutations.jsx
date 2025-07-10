import React from 'react';
import CodeEditor from "../CodeEditor";

const Permutations = ({ problem, code, setCode, language, handleRunBuiltIn, handleRunCustom, customInput, setCustomInput, output, loading }) => {
  return (
    <div className="space-y-4">
      <CodeEditor 
        code={code} 
        setCode={setCode} 
        output={output}
        language={language}
        handleRun={handleRunBuiltIn}
        handleSubmit={handleRunCustom}
      />
    </div>
  );
};

export default Permutations;