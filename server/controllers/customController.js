const { executeCpp } = require('../utils/executeCpp');
const { executeJava } = require('../utils/executeJava');
const { executePy } = require('../utils/executePython');
const { generateFile } = require('../utils/generateFile');

// 👇 Inline import of getTestCode function from codeRoutes.js
const codeRoutes = require('../routes/codeRoutes');

const runCode = async (req, res) => {
  const { language, code, problemId, input = "" } = req.body;

  try {
    const finalCode = getTestCode(code, input, problemId, language); // ✅ use injected main()
    const filepath = generateFile(language, finalCode);

    let output;

    if (language === "cpp") {
      output = await executeCpp(filepath, input);
    } else if (language === "java") {
      output = await executeJava(filepath, input);
    } else if (language === "python") {
      output = await executePy(filepath, input);
    } else {
      return res.status(400).json({ error: "Unsupported language" });
    }

    return res.json({ output });
  } catch (err) {
    return res.status(500).json({ error: err.stderr || err.message });
  }
};

module.exports = { runCode };
