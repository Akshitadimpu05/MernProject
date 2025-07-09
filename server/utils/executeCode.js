const path = require("path");
const fs = require("fs");
const { executeCpp, cleanupCpp } = require("./executeCpp");
const { executeJava, cleanupJava } = require("./executeJava");
const { executePython, cleanupPython } = require("./executePython");

/**
 * Generates a source code file for the specified language.
 * @param {string} language - The programming language (cpp, java, python).
 * @param {string} code - The source code to write to the file.
 * @returns {string} - The path to the generated file.
 */
const generateFile = (language, code) => {
  const tempDir = path.join(__dirname, '..', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Define file extension based on language
  const extensions = {
    cpp: 'cpp',
    java: 'java',
    python: 'py'
  };
  
  const extension = extensions[language] || extensions.cpp;
  const fileName = `code_${Date.now()}.${extension}`;
  const filePath = path.join(tempDir, fileName);
  
  fs.writeFileSync(filePath, code);
  console.log(`Generated ${language} file: ${filePath}`);
  
  return filePath;
};

/**
 * Executes code in the specified language.
 * @param {string} language - The programming language (cpp, java, python).
 * @param {string} code - The source code to execute.
 * @returns {Promise<Object>} - A promise that resolves with the execution result.
 */
const executeCode = async (language, code) => {
  const filePath = generateFile(language, code);
  
  try {
    let output;
    console.log(`Executing ${language} code from ${filePath}`);
    
    switch (language) {
      case 'java':
        output = await executeJava(filePath);
        break;
      
      case 'python':
        output = await executePython(filePath);
        break;
      
      case 'cpp':
      default:
        output = await executeCpp(filePath);
        break;
    }
    
    console.log(`Execution successful, output: ${output}`);
    return { success: true, output };
  } catch (error) {
    console.error(`Execution failed: ${JSON.stringify(error)}`);
    
    return { 
      success: false, 
      error: error.stderr || (error.error ? error.error.message : error.message) || "Execution error" 
    };
  } finally {
    // Always clean up the files after execution
    cleanupExecutionFiles(language, filePath);
  }
};

/**
 * Cleans up files after code execution.
 * @param {string} language - The programming language.
 * @param {string} filePath - The path to the source file.
 */
const cleanupExecutionFiles = (language, filePath) => {
  switch (language) {
    case 'java':
      cleanupJava(filePath);
      break;
    
    case 'python':
      cleanupPython(filePath);
      break;
    
    case 'cpp':
    default:
      cleanupCpp(filePath);
      break;
  }
};

module.exports = {
  generateFile,
  executeCode
};