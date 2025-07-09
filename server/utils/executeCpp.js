const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Create outputs directory if it doesn't exist
const outputPath = path.join(__dirname, "..", "outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Compiles and executes a C++ file.
 * @param {string} filepath - Full path of the source code file.
 * @returns {Promise<string>} - A promise that resolves with the program output.
 */
const executeCpp = (filepath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outFile = process.platform === "win32" ? `${jobId}.exe` : `${jobId}.out`;
  const outPath = path.join(outputPath, outFile);
  
  return new Promise((resolve, reject) => {
    const command = process.platform === "win32"
      ? `g++ "${filepath}" -o "${outPath}" && "${outPath}"`
      : `g++ "${filepath}" -o "${outPath}" && "${outPath}"`;
    
    console.log(`Executing C++ command: ${command}`);
    
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`C++ execution error: ${error.message}`);
        reject({ error, stderr });
        return;
      }
      
      if (stderr && stderr.trim() !== "") {
        console.error(`C++ stderr: ${stderr}`);
        reject({ stderr });
        return;
      }
      
      console.log(`C++ stdout: ${stdout}`);
      resolve(stdout);
    });
  });
};

/**
 * Cleans up C++ files after execution.
 * @param {string} filepath - Full path of the source code file.
 */
const cleanupCpp = (filepath) => {
  try {
    // Remove source file
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`Removed C++ source file: ${filepath}`);
    }
    
    // Remove output executable
    const jobId = path.basename(filepath).split(".")[0];
    const outFile = process.platform === "win32" ? `${jobId}.exe` : `${jobId}.out`;
    const outPath = path.join(outputPath, outFile);
    
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
      console.log(`Removed C++ output file: ${outPath}`);
    }
  } catch (error) {
    console.error('Error cleaning up C++ files:', error);
  }
};

module.exports = {
  executeCpp,
  cleanupCpp
};