import React from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ code, setCode }) => {
  // Determine editor language
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
          theme: "vs-dark",
          background: "#1E1E1E"
        }}
        beforeMount={(monaco) => {
          monaco.editor.defineTheme('customDarkTheme', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#1E1E1E',
            }
          });
          monaco.editor.setTheme('customDarkTheme');
        }}
      />
    </div>
  );
};

export default CodeEditor;
