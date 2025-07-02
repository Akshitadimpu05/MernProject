const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Compiles and executes a C++ file.
 * @param {string} filepath - Full path of the source code file.
 */
const executeCpp = (filepath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outFile = os.platform() === "win32"
    ? `${jobId}.exe`
    : `${jobId}.out`;
  const outPath = path.join(outputPath, outFile);

  const command = os.platform() === "win32"
    ? `g++ ${filepath} -o ${outPath} && ${outPath}`
    : `g++ ${filepath} -o ${outPath} && ${outPath}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject({ error, stderr });
      }
      if (stderr) {
        return reject(stderr);
      }
      resolve(stdout);
    });
  });
};

module.exports = {
  executeCpp,
};
