const { generateFile } = require("../utils/generateFile");
const { executeCpp } = require("../utils/executeCpp");

const runCode = async (req, res) => {
  const { language = "cpp", code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: "Code is required" });
  }

  try {
    const filepath = generateFile(language, code);
    const output = await executeCpp(filepath);
    res.json({ output });
  } catch (err) {
    res.status(500).json({ error: err.stderr || "Execution error" });
  }
};

module.exports = { runCode };
