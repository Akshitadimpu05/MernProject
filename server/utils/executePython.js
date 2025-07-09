const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Executes a Python file.
 * @param {string} filepath - Full path of the Python source code file.
 * @returns {Promise<string>} - A promise that resolves with the program output.
 */
const executePython = (filepath) => {
  return new Promise((resolve, reject) => {
    // Choose between python or python3 depending on your system configuration
    const command = `python3 "${filepath}"`;
    
    console.log(`Executing Python: ${command}`);
    
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Python execution error: ${error.message}`);
        reject({ error, stderr });
        return;
      }
      
      if (stderr && stderr.trim() !== "") {
        console.error(`Python stderr: ${stderr}`);
        reject({ stderr });
        return;
      }
      
      console.log(`Python stdout: ${stdout}`);
      resolve(stdout);
    });
  });
};

/**
 * Cleans up Python files after execution.
 * @param {string} filepath - Full path of the Python source code file.
 */
const cleanupPython = (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`Removed Python file: ${filepath}`);
    }
    
    // Remove any .pyc files if they exist
    const pycFile = filepath.replace('.py', '.pyc');
    if (fs.existsSync(pycFile)) {
      fs.unlinkSync(pycFile);
      console.log(`Removed Python bytecode file: ${pycFile}`);
    }
    
    // Remove __pycache__ directory if it exists
    const dirPath = path.dirname(filepath);
    const pycacheDir = path.join(dirPath, '__pycache__');
    if (fs.existsSync(pycacheDir)) {
      fs.rmSync(pycacheDir, { recursive: true, force: true });
      console.log(`Removed Python cache directory: ${pycacheDir}`);
    }
  } catch (error) {
    console.error('Error cleaning up Python files:', error);
  }
};

module.exports = {
  executePython,
  cleanupPython
};