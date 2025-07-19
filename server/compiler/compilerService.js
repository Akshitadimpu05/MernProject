const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL || 'https://algowebapp.vercel.app'] 
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Create temp and output directories
const tempDir = path.join(__dirname, 'temp');
const outputDir = path.join(__dirname, 'outputs');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'compiler' });
});

// Compile and run code
app.post('/api/run', async (req, res) => {
  try {
    const { language, code, input } = req.body;
    
    if (!language || !code) {
      return res.status(400).json({ error: 'Language and code are required' });
    }
    
    const id = uuidv4();
    const result = await compileAndRun(language, code, input, id);
    res.json(result);
  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({ error: 'Failed to run code', details: error.message });
  }
});

// Function to compile and run code
async function compileAndRun(language, code, input, id) {
  const codeFilePath = path.join(tempDir, `${id}.${getFileExtension(language)}`);
  const inputFilePath = path.join(tempDir, `${id}.in`);
  const outputFilePath = path.join(outputDir, `${id}.out`);
  
  // Write code and input to files
  fs.writeFileSync(codeFilePath, code);
  if (input) {
    fs.writeFileSync(inputFilePath, input);
  }
  
  let compileCommand = '';
  let runCommand = '';
  
  switch (language) {
    case 'cpp':
      compileCommand = `g++ ${codeFilePath} -o ${path.join(tempDir, id)}`;
      runCommand = input 
        ? `${path.join(tempDir, id)} < ${inputFilePath} > ${outputFilePath} 2>&1`
        : `${path.join(tempDir, id)} > ${outputFilePath} 2>&1`;
      break;
    case 'java':
      // Extract class name from code
      const className = extractJavaClassName(code) || 'Main';
      const classFilePath = path.join(tempDir, `${className}.java`);
      
      // Rename file to match class name
      fs.writeFileSync(classFilePath, code);
      
      compileCommand = `javac ${classFilePath}`;
      runCommand = input 
        ? `cd ${tempDir} && java ${className} < ${inputFilePath} > ${outputFilePath} 2>&1`
        : `cd ${tempDir} && java ${className} > ${outputFilePath} 2>&1`;
      break;
    case 'python':
      compileCommand = ''; // No compilation needed
      runCommand = input 
        ? `python3 ${codeFilePath} < ${inputFilePath} > ${outputFilePath} 2>&1`
        : `python3 ${codeFilePath} > ${outputFilePath} 2>&1`;
      break;
    default:
      throw new Error('Unsupported language');
  }
  
  try {
    // Compile if needed
    if (compileCommand) {
      await executeCommand(compileCommand);
    }
    
    // Set timeout for execution (5 seconds)
    const startTime = Date.now();
    await executeCommand(runCommand, 5000);
    const endTime = Date.now();
    
    // Read output
    const output = fs.existsSync(outputFilePath) 
      ? fs.readFileSync(outputFilePath, 'utf8')
      : '';
    
    // Clean up files
    cleanupFiles(id, language);
    
    return {
      status: 'success',
      output,
      executionTime: endTime - startTime,
      memoryUsed: 0 // Memory tracking not implemented
    };
  } catch (error) {
    // Clean up files
    cleanupFiles(id, language);
    
    if (error.message.includes('timeout')) {
      return {
        status: 'error',
        output: 'Execution timed out (5 seconds limit)',
        error: 'Time Limit Exceeded'
      };
    }
    
    return {
      status: 'error',
      output: error.message,
      error: 'Runtime Error'
    };
  }
}

// Helper function to execute shell commands
function executeCommand(command, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const process = exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout);
      }
    });
  });
}

// Helper function to get file extension based on language
function getFileExtension(language) {
  switch (language) {
    case 'cpp': return 'cpp';
    case 'java': return 'java';
    case 'python': return 'py';
    default: return 'txt';
  }
}

// Helper function to extract Java class name
function extractJavaClassName(code) {
  const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
  return classMatch ? classMatch[1] : null;
}

// Helper function to clean up temporary files
function cleanupFiles(id, language) {
  try {
    const codeFilePath = path.join(tempDir, `${id}.${getFileExtension(language)}`);
    const inputFilePath = path.join(tempDir, `${id}.in`);
    const outputFilePath = path.join(outputDir, `${id}.out`);
    const executablePath = path.join(tempDir, id);
    
    // Remove files if they exist
    if (fs.existsSync(codeFilePath)) fs.unlinkSync(codeFilePath);
    if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
    if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
    if (fs.existsSync(executablePath)) fs.unlinkSync(executablePath);
    
    // For Java, also clean up class files
    if (language === 'java') {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        if (file.endsWith('.class') && file.startsWith(id)) {
          fs.unlinkSync(path.join(tempDir, file));
        }
      });
    }
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
}

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Compiler service running on port ${PORT}`);
});

module.exports = app;
