const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Create outputs directory if it doesn't exist
const outputPath = path.join(__dirname, "..", "outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Compiles and executes a Java file.
 * @param {string} filepath - Full path of the Java source code file.
 * @returns {Promise<string>} - A promise that resolves with the program output.
 */
const executeJava = (filepath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const classOutputDir = path.join(outputPath, jobId);
  
  // Create a temporary directory for class files
  if (!fs.existsSync(classOutputDir)) {
    fs.mkdirSync(classOutputDir, { recursive: true });
  }
  
  return new Promise((resolve, reject) => {
    // First, compile the Java file
    const compileCommand = `javac -d "${classOutputDir}" "${filepath}"`;
    
    console.log(`Compiling Java: ${compileCommand}`);
    
    exec(compileCommand, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        console.error(`Java compilation error: ${compileError.message}`);
        reject({ error: compileError, stderr: compileStderr });
        return;
      }
      
      if (compileStderr && compileStderr.trim() !== "") {
        console.error(`Java compilation stderr: ${compileStderr}`);
        reject({ stderr: compileStderr });
        return;
      }
      
      console.log("Java compilation successful");
      
      // Find the main class by parsing the Java file
      // This assumes the format "public class ClassName { public static void main"
      try {
        const fileContent = fs.readFileSync(filepath, 'utf8');
        const classMatch = fileContent.match(/class\s+([A-Za-z0-9_]+)\s*{/);
        const mainClass = classMatch ? classMatch[1] : "Solution"; // Default to Solution if not found
        
        console.log(`Found main class: ${mainClass}`);
        
        // Execute the compiled Java program
        const executeCommand = `cd "${classOutputDir}" && java ${mainClass}`;
        
        console.log(`Executing Java: ${executeCommand}`);
        
        exec(executeCommand, { timeout: 15000 }, (executeError, executeStdout, executeStderr) => {
          if (executeError) {
            console.error(`Java execution error: ${executeError.message}`);
            reject({ error: executeError, stderr: executeStderr });
            return;
          }
          
          if (executeStderr && executeStderr.trim() !== "") {
            console.error(`Java execution stderr: ${executeStderr}`);
            reject({ stderr: executeStderr });
            return;
          }
          
          console.log(`Java execution stdout: ${executeStdout}`);
          resolve(executeStdout);
        });
      } catch (err) {
        console.error(`Error parsing Java file: ${err.message}`);
        reject({ error: err, stderr: "Error finding main class" });
      }
    });
  });
};

/**
 * Cleans up Java files after execution.
 * @param {string} filepath - Full path of the Java source code file.
 */
const cleanupJava = (filepath) => {
  try {
    const jobId = path.basename(filepath).split(".")[0];
    const classOutputDir = path.join(outputPath, jobId);
    
    // Delete the source file
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`Removed Java source file: ${filepath}`);
    }
    
    // Recursively delete the class output directory
    if (fs.existsSync(classOutputDir)) {
      fs.rmSync(classOutputDir, { recursive: true, force: true });
      console.log(`Removed Java class directory: ${classOutputDir}`);
    }
  } catch (error) {
    console.error('Error cleaning up Java files:', error);
  }
};

module.exports = {
  executeJava,
  cleanupJava
};