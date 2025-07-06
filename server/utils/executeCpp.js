const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "..", "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Compiles and executes a C++ file.
 * @param {string} filepath - Full path of the source code file.
 */
const executeCpp = (filepath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outFile = process.platform === "win32"
    ? `${jobId}.exe`
    : `${jobId}.out`;
  const outPath = path.join(outputPath, outFile);

  const command = process.platform === "win32"
    ? `g++ "${filepath}" -o "${outPath}" && "${outPath}"`
    : `g++ "${filepath}" -o "${outPath}" && "${outPath}"`;

  return new Promise((resolve, reject) => {
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
        return;
      }
      if (stderr) {
        reject({ stderr });
        return;
      }
      resolve(stdout);
    });
  });
};

module.exports = {
  executeCpp,
};