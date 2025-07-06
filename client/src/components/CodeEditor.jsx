import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const CodeEditor = ({ code, onChange, onRun }) => {
  const handleCodeChange = (newCode) => {
    onChange(newCode);
  };

  return (
    <div className="space-y-4">
      <Editor
        height="60vh"
        defaultLanguage="cpp"
        value={code}
        onChange={handleCodeChange}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: "on",
          theme: "vs-dark"
        }}
      />
    </div>
  );
};

export default CodeEditor;