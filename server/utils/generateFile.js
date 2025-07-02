const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirCodes = path.join(__dirname, "codes");

if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

/**
 * Writes the code to a uniquely named file.
 * @param {string} format - e.g., 'cpp'
 * @param {string} content - source code text
 */
const generateFile = (format, content) => {
  const jobID = uuid();
  const filename = `${jobID}.${format}`;
  const filePath = path.join(dirCodes, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
};

module.exports = {
  generateFile,
};
