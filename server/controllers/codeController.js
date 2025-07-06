const path = require("path");
const fs = require("fs");

// Helper function to generate file
const generateFile = (language, code) => {
  const tempDir = path.join(__dirname, "..", "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const fileName = `code_${Date.now()}.${language === 'cpp' ? 'cpp' : language}`;
  const filePath = path.join(tempDir, fileName);

  fs.writeFileSync(filePath, code);
  return filePath;
};

// Helper function to execute C++ code (moved to executeCpp.js)
const executeCpp = require("../utils/executeCpp").executeCpp;

// Helper function to clean up temporary files
const cleanupFiles = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    const outFile = process.platform === "win32"
      ? `${path.basename(filePath).split(".")[0]}.exe`
      : `${path.basename(filePath).split(".")[0]}.out`;
    const outPath = path.join(__dirname, '..', 'outputs', outFile);
    
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
};

const runCode = async (req, res) => {
  const { language = "cpp", code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: "Code is required" });
  }

  try {
    const filepath = generateFile(language, code);
    
    try {
      const output = await executeCpp(filepath);
      cleanupFiles(filepath);
      res.json({ success: true, output });
    } catch (err) {
      cleanupFiles(filepath);
      res.status(500).json({ 
        success: false, 
        error: err.stderr || "Execution error" 
      });
    }
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message || "Server error" 
    });
  }
};

module.exports = { 
  runCode,
  generateFile,
  cleanupFiles
};