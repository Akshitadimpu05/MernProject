const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirCodes = path.join(__dirname, "..", "temp");

if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

/**
 * Generate file for code execution.
 * - Java => Solution.java (because public class must match filename)
 * - Python => solution.py (static file for consistency)
 * - Others => use UUID + extension
 */
const generateFile = (language, content) => {
  let filename;

  if (language === "java") {
    filename = "Solution.java"; // Must match class name
  } else if (language === "python") {
    filename = "solution.py"; // Static Python filename
  } else {
    const jobId = uuid();
    const extension = language === "cpp" ? "cpp" : language;
    filename = `${jobId}.${extension}`;
  }

  const filepath = path.join(dirCodes, filename);
  fs.writeFileSync(filepath, content);
  return filepath;
};

module.exports = {
  generateFile,
};
