const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Estimate time/space complexity using regex pattern detection
function calculateTimeComplexity(code, language = 'cpp') {
  let result = {
    timeComplexity: 'Unknown',
    spaceComplexity: 'Unknown',
    details: []
  };

  try {
    const patterns = {
      quadratic: {
        cpp: /for\s*\([^{]*\)\s*{[^}]*for\s*\(/g,
        java: /for\s*\([^{]*\)\s*{[^}]*for\s*\(/g,
        python: /for\s+[^:]*:[^:]*for\s+/g
      },
      linear: {
        cpp: /for\s*\([^{]*\)/g,
        java: /for\s*\([^{]*\)/g,
        python: /for\s+[^:]*/g
      },
      logarithmic: {
        cpp: /(binary_search|\/=\s*2|>>=|mid\s*=)/g,
        java: /(binarySearch|\/=\s*2|>>=|mid\s*=)/g,
        python: /(bisect|\/\/\s*2|mid\s*=)/g
      },
      constant: {
        cpp: /(unordered_map|unordered_set)/g,
        java: /(HashMap|HashSet)/g,
        python: /dict\(|set\(|\{\}|\{\s*:/g
      },
      recursive: {
        cpp: /\w+\s*\([^)]*\)\s*{[^}]*\1\s*\(/g,
        java: /\w+\s*\([^)]*\)\s*{[^}]*\1\s*\(/g,
        python: /def\s+(\w+)[^:]*:[^:]*\1\s*\(/g
      }
    };

    const langPatterns = {
      cpp: Object.fromEntries(Object.entries(patterns).map(([k, v]) => [k, v.cpp])),
      java: Object.fromEntries(Object.entries(patterns).map(([k, v]) => [k, v.java])),
      python: Object.fromEntries(Object.entries(patterns).map(([k, v]) => [k, v.python]))
    }[language] || patterns.cpp;

    let complexityIndicators = {};
    for (const [key, regex] of Object.entries(langPatterns)) {
      complexityIndicators[key] = (code.match(regex) || []).length;
    }

    // Decide complexity
    if (complexityIndicators.recursive > 0) {
      result.timeComplexity = 'O(2^n)';
      result.details.push('Detected recursive pattern');
    } else if (complexityIndicators.quadratic > 0) {
      result.timeComplexity = 'O(n²)';
      result.details.push('Detected nested loops');
    } else if (complexityIndicators.linear > 0 && complexityIndicators.logarithmic > 0) {
      result.timeComplexity = 'O(n log n)';
      result.details.push('Detected loop + log');
    } else if (complexityIndicators.linear > 0) {
      result.timeComplexity = 'O(n)';
      result.details.push('Detected single loops');
    } else if (complexityIndicators.logarithmic > 0) {
      result.timeComplexity = 'O(log n)';
      result.details.push('Detected divide & conquer');
    } else if (complexityIndicators.constant > 0) {
      result.timeComplexity = 'O(1)';
    }

    // Space complexity (rough)
    if (code.includes('new ') || code.includes('malloc') || code.includes('= []') || code.includes('= {}')) {
      result.spaceComplexity = complexityIndicators.quadratic > 0 ? 'O(n²)' : 'O(n)';
    } else {
      result.spaceComplexity = 'O(1)';
    }
  } catch (err) {
    console.error('Error calculating code complexity:', err);
  }

  return result;
}

// === GEMINI 1.5 FLASH ===
async function getGeminiOptimizations(code, language, problemId, complexityAnalysis) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an expert software engineer specializing in algorithm optimization.
Analyze the following ${language} code for problem #${problemId}:

\`\`\`${language}
${code}
\`\`\`

The code has a time complexity of approximately ${complexityAnalysis.timeComplexity}
and space complexity of ${complexityAnalysis.spaceComplexity}.

Please provide:
1. A brief analysis of the approach used
2. Suggestions for optimizing the code (if possible)
3. An improved version of the code with better time/space complexity or better readability
4. Explanation of the improvements made

Format your response as JSON with the following structure:
{
  "analysis": "...",
  "suggestions": ["..."],
  "optimizedCode": "...",
  "improvements": "...",
  "optimizedTimeComplexity": "O(?)",
  "optimizedSpaceComplexity": "O(?)"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let jsonStr = responseText;
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini failed, using OpenAI as fallback...");
    return await getOpenAIOptimizations(code, language, problemId, complexityAnalysis);
  }
}

// === OPENAI FALLBACK ===
async function getOpenAIOptimizations(code, language, problemId, complexityAnalysis) {
  try {
    const prompt = `
You are an expert software engineer specializing in algorithm optimization.
Analyze the following ${language} code for problem #${problemId}:

\`\`\`${language}
${code}
\`\`\`

The code has a time complexity of approximately ${complexityAnalysis.timeComplexity}
and space complexity of ${complexityAnalysis.spaceComplexity}.

Please provide:
1. A brief analysis of the approach used
2. Suggestions for optimizing the code (if possible)
3. An improved version of the code with better time/space complexity or better readability
4. Explanation of the improvements made

Format your response as JSON with the following structure:
{
  "analysis": "...",
  "suggestions": ["..."],
  "optimizedCode": "...",
  "improvements": "...",
  "optimizedTimeComplexity": "O(?)",
  "optimizedSpaceComplexity": "O(?)"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const text = completion.choices[0].message.content;

    let jsonStr = text;
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }

    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("OpenAI fallback failed:", err.message);
    return {
      analysis: "OpenAI fallback failed.",
      suggestions: ["Review the code manually"],
      optimizedCode: code,
      improvements: "Could not analyze due to fallback failure",
      optimizedTimeComplexity: complexityAnalysis?.timeComplexity || "Unknown",
      optimizedSpaceComplexity: complexityAnalysis?.spaceComplexity || "Unknown"
    };
  }
}

// === MAIN ANALYSIS ===
async function analyzeCode(code, language, problemId, passed) {
  let complexityAnalysis = {
    timeComplexity: 'Unknown',
    spaceComplexity: 'Unknown',
    details: []
  };

  try {
    complexityAnalysis = calculateTimeComplexity(code, language);

    const suggestions = await getGeminiOptimizations(
      code,
      language,
      problemId,
      complexityAnalysis
    );

    return {
      passed,
      complexity: complexityAnalysis,
      suggestions
    };
  } catch (err) {
    console.error("Error analyzing code:", err);
    return {
      error: "Failed to analyze code",
      passed,
      complexity: complexityAnalysis,
      suggestions: {
        analysis: "AI analysis failed",
        suggestions: [],
        optimizedCode: code,
        improvements: "N/A",
        optimizedTimeComplexity: complexityAnalysis.timeComplexity,
        optimizedSpaceComplexity: complexityAnalysis.spaceComplexity
      }
    };
  }
}

module.exports = {
  analyzeCode
};