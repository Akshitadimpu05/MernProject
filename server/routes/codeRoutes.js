const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const Submission = require('../models/Submission');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { executeJava, cleanupJava } = require('../utils/executeJava.js');
const { runCode } = require('../controllers/customController.js');
const { analyzeCode } = require('../services/aiCodeAnalysis');

function generateFile(language, code) {
  const tempDir = path.join(__dirname, '..', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  let extension = 'cpp';
  if (language === 'java') extension = 'java';
  if (language === 'python') extension = 'py';

  // Use consistent Java filename
  const fileName = language === 'java' ? 'Solution.java' : `code_${Date.now()}.${extension}`;
  const filePath = path.join(tempDir, fileName);

  fs.writeFileSync(filePath, code);
  console.log(`Generated ${language} file: ${filePath}`);
  return filePath;
}

// Helper function to execute C++ code
async function executeCpp(filePath) {
  const jobId = path.basename(filePath).split(".")[0];
  const outputPath = path.join(__dirname, '..', 'outputs');
  
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  const outFile = process.platform === "win32" ? `${jobId}.exe` : `${jobId}.out`;
  const outPath = path.join(outputPath, outFile);
  
  return new Promise((resolve, reject) => {
    console.log(`Executing command: g++ ${filePath} -o ${outPath}`);
    
    const command = process.platform === "win32"
      ? `g++ ${filePath} -o ${outPath} && ${outPath}`
      : `g++ ${filePath} -o ${outPath} && ${outPath}`;
    
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      console.log('Execution completed');
      if (error) {
        console.error('Execution error:', error);
        console.error('Stderr:', stderr);
        reject({ error, stderr });
        return;
      }
      if (stderr && stderr.trim() !== '') {
        console.error('Stderr:', stderr);
        reject(stderr);
        return;
      }
      console.log('Stdout:', stdout);
      resolve(stdout);
    });
  });
}



// Helper function to execute Python code
async function executePython(filePath) {
  return new Promise((resolve, reject) => {
    const command = `python3 "${filePath}"`;
    console.log(`Executing Python: ${command}`);
    
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Python execution error:', error);
        reject({ error, stderr });
        return;
      }
      
      console.log('Python stdout:', stdout);
      resolve(stdout);
    });
  });
}

// Helper function to clean up temporary files
function cleanupFiles(filePath, language) {
  try {
    // Remove source file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    const jobId = path.basename(filePath).split(".")[0];
    
    if (language === 'cpp') {
      // Remove output file
      const outFile = process.platform === "win32" ? `${jobId}.exe` : `${jobId}.out`;
      const outPath = path.join(__dirname, '..', 'outputs', outFile);
      
      if (fs.existsSync(outPath)) {
        fs.unlinkSync(outPath);
      }
    } else if (language === 'java') {
      cleanupJava(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
}

// Function to get test cases for a problem
function getTestCases(problemId) {
  console.log(`Getting test cases for problem ${problemId}`);
  
  const testCasesMap = {
    '1': [ // Two Sum
      {
        id: '1',
        input: '{2, 7, 11, 15}, 9',
        expected: '0 1'
      },
      {
        id: '2',
        input: '{3, 2, 4}, 6',
        expected: '1 2'
      },
      {
        id: '3',
        input: '{3, 3}, 6',
        expected: '0 1'
      }
    ],
    '2': [ // Add Two Numbers
      {
        id: '1',
        input: '[2, 4, 3], [5, 6, 4]',
        expected: '7 0 8'
      },
      {
        id: '2',
        input: '[0], [0]',
        expected: '0'
      },
      {
        id: '3',
        input: '[9,9,9,9,9,9,9], [9,9,9,9]',
        expected: '8 9 9 9 0 0 0 1'
      }
    ]
  };
  
  return testCasesMap[problemId] || [];
}

// Function to modify code for test input
function getTestCode(code, input, problemId, language) {
  try {
    if (language === 'cpp') {
      return getCppTestCode(code, input, problemId);
    } else if (language === 'java') {
      return getJavaTestCode(code, input, problemId);
    } else if (language === 'python') {
      return getPythonTestCode(code, input, problemId);
    }
    
    // Default to C++
    return getCppTestCode(code, input, problemId);
  } catch (error) {
    console.error(`Error generating test code: ${error.message}`);
    return code;
  }
}

// For Two Sum problem in C++
function getCppTwoSumTestCode(code, input) {
  try {
    console.log(`Generating C++ Two Sum test code for input: ${input}`);
    
    // Extract array and target
    let parts = input.split('},');
    if (parts.length !== 2) {
      parts = input.split(',');
      parts = [parts.slice(0, -1).join(','), parts[parts.length - 1]];
    }
    
    let numsStr = parts[0].trim();
    let targetStr = parts[1].trim();
    
    // Remove braces
    if (numsStr.startsWith('{')) numsStr = numsStr.substring(1);
    if (numsStr.endsWith('}')) numsStr = numsStr.substring(0, numsStr.length - 1);
    
    console.log(`Parsed: nums=[${numsStr}], target=${targetStr}`);
    
    // Create main function
    const mainFunction = `
int main() {
    Solution sol;
    vector<int> nums = {${numsStr}};
    int target = ${targetStr};
    vector<int> result = sol.twoSum(nums, target);
    for (int num : result) {
        cout << num << " ";
    }
    return 0;
}`;

    // Replace main function in code, or append if it doesn't exist
    const mainRegex = /int\s+main\s*\(\s*\)\s*{[\s\S]*?return\s+0\s*;?\s*}/g;
    if (mainRegex.test(code)) {
      return code.replace(mainRegex, mainFunction);
    }
    return code + '\n' + mainFunction;
  } catch (error) {
    console.error(`Error in C++ Two Sum test code: ${error.message}`);
    return code;
  }
}

// For Add Two Numbers problem in C++
function getCppAddTwoNumbersTestCode(code, input) {
  try {
    console.log(`Generating C++ Add Two Numbers test code for input: ${input}`);
    
    // Match array patterns like [2, 4, 3]
    const lists = input.match(/\[(.*?)\]/g).map(list => 
      list.slice(1, -1).split(',').map(n => n.trim())
    );
    
    if (lists.length !== 2) {
      throw new Error('Invalid Add Two Numbers input format');
    }
    
    const l1 = lists[0];
    const l2 = lists[1];
    
    console.log(`Parsed: l1=[${l1}], l2=[${l2}]`);
    
    // Generate ListNode creation code
    let listCode = '';
    
    // First list
    listCode += 'ListNode* l1 = nullptr;\n';
    listCode += 'ListNode* curr1 = nullptr;\n';
    
    l1.forEach((val, idx) => {
      if (idx === 0) {
        listCode += `l1 = new ListNode(${val});\n`;
        listCode += `curr1 = l1;\n`;
      } else {
        listCode += `curr1->next = new ListNode(${val});\n`;
        listCode += `curr1 = curr1->next;\n`;
      }
    });
    
    // Second list
    listCode += 'ListNode* l2 = nullptr;\n';
    listCode += 'ListNode* curr2 = nullptr;\n';
    
    l2.forEach((val, idx) => {
      if (idx === 0) {
        listCode += `l2 = new ListNode(${val});\n`;
        listCode += `curr2 = l2;\n`;
      } else {
        listCode += `curr2->next = new ListNode(${val});\n`;
        listCode += `curr2 = curr2->next;\n`;
      }
    });
    
    // Create main function
    const mainFunction = `
int main() {
    Solution sol;
    
    // Create lists
    ${listCode}
    
    // Get result
    ListNode* result = sol.addTwoNumbers(l1, l2);
    
    // Print result
    while (result) {
        cout << result->val << " ";
        result = result->next;
    }
    
    return 0;
}`;

    // Replace main function in code, or append if it doesn't exist
    const mainRegex = /int\s+main\s*\(\s*\)\s*{[\s\S]*?return\s+0\s*;?\s*}/g;
    if (mainRegex.test(code)) {
      return code.replace(mainRegex, mainFunction);
    }
    return code + '\n' + mainFunction;
  } catch (error) {
    console.error(`Error in C++ Add Two Numbers test code: ${error.message}`);
    return code;
  }
}

// Function to modify C++ code for test input
function getCppTestCode(code, input, problemId) {
  if (problemId === '1') {
    return getCppTwoSumTestCode(code, input);
  } else if (problemId === '2') {
    return getCppAddTwoNumbersTestCode(code, input);
  }
  
  return code;
}

// For Java Two Sum test code
function getJavaTwoSumTestCode(code, input) {
  try {
    console.log(`Generating Java Two Sum test code for input: ${input}`);

    // ✅ Skip if main already exists
    if (/public\s+static\s+void\s+main\s*\(/.test(code)) {
      console.log('Java main method already exists. Skipping injection.');
      return code;
    }

    // Parse input
    let parts = input.split('},');
    if (parts.length !== 2) {
      parts = input.split(',');
      parts = [parts.slice(0, -1).join(','), parts[parts.length - 1]];
    }

    let numsStr = parts[0].trim();
    let targetStr = parts[1].trim();

    if (numsStr.startsWith('{')) numsStr = numsStr.slice(1);
    if (numsStr.endsWith('}')) numsStr = numsStr.slice(0, -1);

    const mainMethod = `
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = {${numsStr}};
        int target = ${targetStr};
        int[] result = sol.twoSum(nums, target);
        for (int num : result) {
            System.out.print(num + " ");
        }
    }`;

    // Inject before class closing brace
    const lastBrace = code.lastIndexOf('}');
    if (lastBrace !== -1) {
      return code.slice(0, lastBrace) + mainMethod + '\n}';
    }

    return code + '\n' + mainMethod;
  } catch (error) {
    console.error(`Error in Java Two Sum test code: ${error.message}`);
    return code;
  }
}

// For Java Add Two Numbers test code
function getJavaAddTwoNumbersTestCode(code, input) {
  try {
    console.log(`Generating Java Add Two Numbers test code for input: ${input}`);

    // ✅ Skip if main already exists
    if (/public\s+static\s+void\s+main\s*\(/.test(code)) {
      console.log('Java main method already exists. Skipping injection.');
      return code;
    }

    const lists = input.match(/\[(.*?)\]/g).map(list =>
      list.slice(1, -1).split(',').map(n => n.trim())
    );

    if (lists.length !== 2) {
      throw new Error('Invalid input format for Add Two Numbers');
    }

    const l1 = lists[0];
    const l2 = lists[1];

    const mainMethod = `
    public static void main(String[] args) {
        Solution sol = new Solution();

        ListNode l1 = null;
        ListNode curr1 = null;
        ${l1.map((val, idx) =>
          idx === 0
            ? `l1 = new ListNode(${val}); curr1 = l1;`
            : `curr1.next = new ListNode(${val}); curr1 = curr1.next;`
        ).join('\n        ')}

        ListNode l2 = null;
        ListNode curr2 = null;
        ${l2.map((val, idx) =>
          idx === 0
            ? `l2 = new ListNode(${val}); curr2 = l2;`
            : `curr2.next = new ListNode(${val}); curr2 = curr2.next;`
        ).join('\n        ')}

        ListNode result = sol.addTwoNumbers(l1, l2);
        while (result != null) {
            System.out.print(result.val + " ");
            result = result.next;
        }
    }`;

    const lastBrace = code.lastIndexOf('}');
    if (lastBrace !== -1) {
      return code.slice(0, lastBrace) + mainMethod + '\n}';
    }

    return code + '\n' + mainMethod;
  } catch (error) {
    console.error(`Error in Java Add Two Numbers test code: ${error.message}`);
    return code;
  }
}

// Function to modify Java code for test input
function getJavaTestCode(code, input, problemId) {
  if (problemId === '1') {
    return getJavaTwoSumTestCode(code, input);
  } else if (problemId === '2') {
    return getJavaAddTwoNumbersTestCode(code, input);
  }
  
  return code;
}

// For Python Two Sum test code


function getPythonTwoSumTestCode(code, input) {
  try {
    console.log(`Generating Python Two Sum test code for input: ${input}`);
    
    // Extract array and target
    let parts = input.split('},');
    if (parts.length !== 2) {
      parts = input.split(',');
      parts = [parts.slice(0, -1).join(','), parts[parts.length - 1]];
    }
    
    let numsStr = parts[0].trim();
    let targetStr = parts[1].trim();
    
    // Remove braces
    if (numsStr.startsWith('{')) numsStr = numsStr.substring(1);
    if (numsStr.endsWith('}')) numsStr = numsStr.substring(0, numsStr.length - 1);
    
    console.log(`Parsed: nums=[${numsStr}], target=${targetStr}`);
    
    // Create main block
    const mainBlock = `
if __name__ == "__main__":
    sol = Solution()
    nums = [${numsStr}]
    target = ${targetStr}
    result = sol.twoSum(nums, target)
    print(' '.join(map(str, result)))`;
    
    // Replace main block in code or add it
    if (code.includes('if __name__ == "__main__"')) {
      return code.replace(/if\s+__name__\s*==\s*"__main__"[\s\S]*?(?=\n\S|$)/, mainBlock);
    } else {
      return code + '\n' + mainBlock;
    }
  } catch (error) {
    console.error(`Error in Python Two Sum test code: ${error.message}`);
    return code;
  }
}

// For Python Add Two Numbers test code
function getPythonAddTwoNumbersTestCode(code, input) {
  try {
    console.log(`Generating Python Add Two Numbers test code for input: ${input}`);
    
    // Match array patterns like [2, 4, 3]
    const lists = input.match(/\[(.*?)\]/g).map(list => 
      list.slice(1, -1).split(',').map(n => n.trim())
    );
    
    if (lists.length !== 2) {
      throw new Error('Invalid Add Two Numbers input format');
    }
    
    const l1 = lists[0];
    const l2 = lists[1];
    
    console.log(`Parsed: l1=[${l1}], l2=[${l2}]`);
    
    // Create main block
    const mainBlock = `
if __name__ == "__main__":
    sol = Solution()
    
    # Create first list
    l1 = None
    curr = None
    ${l1.map((val, idx) => 
      idx === 0 
        ? `l1 = ListNode(${val}); curr = l1` 
        : `curr.next = ListNode(${val}); curr = curr.next`
    ).join('\n    ')}
    
    # Create second list
    l2 = None
    curr = None
    ${l2.map((val, idx) => 
      idx === 0 
        ? `l2 = ListNode(${val}); curr = l2` 
        : `curr.next = ListNode(${val}); curr = curr.next`
    ).join('\n    ')}
    
    # Get result
    result = sol.addTwoNumbers(l1, l2)
    
    # Print result
    output = []
    while result:
        output.append(str(result.val))
        result = result.next
    print(' '.join(output))`;
    
    // Replace main block in code or add it
    if (code.includes('if __name__ == "__main__"')) {
      return code.replace(/if\s+__name__\s*==\s*"__main__"[\s\S]*?(?=\n\S|$)/, mainBlock);
    } else {
      return code + '\n' + mainBlock;
    }
  } catch (error) {
    console.error(`Error in Python Add Two Numbers test code: ${error.message}`);
    return code;
  }
}

// Function to modify Python code for test input
function getPythonTestCode(code, input, problemId) {
  if (problemId === '1') {
    return getPythonTwoSumTestCode(code, input);
  } else if (problemId === '2') {
    return getPythonAddTwoNumbersTestCode(code, input);
  }
  
  return code;
}

// Run code endpoint
router.post('/run', async (req, res) => {
  console.log('Run code endpoint called');
  
  try {
    const { problemId, code, language = 'cpp' } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({ error: 'Problem ID and code are required' });
    }

    const testCases = getTestCases(problemId);
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ error: 'No test cases found for this problem' });
    }

    // Use the first test case for the 'run' functionality
    const firstTestCase = testCases[0];
    const testCode = getTestCode(code, firstTestCase.input, problemId, language);

    const filePath = generateFile(language, testCode);

    try {
      let output;
      if (language === 'cpp') {
        output = await executeCpp(filePath);
      } else if (language === 'java') {
        output = await executeJava(filePath);
      } else if (language === 'python') {
        output = await executePython(filePath);
      } else {
        output = await executeCpp(filePath);
      }
      
      cleanupFiles(filePath, language);
      res.json({ output });
    } catch (err) {
      cleanupFiles(filePath, language);
      res.status(500).json({ 
        error: err.stderr || "Execution error",
        details: err.toString()
      });
    }
  } catch (error) {
    console.error('Error in run endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI analysis endpoint
router.post('/analyze', async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    
    if (!code || !language || !problemId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const analysis = await analyzeCode(code, language, problemId, true);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ error: error.message });
  }
}); 


// Submit solution endpoint
router.post('/submit', async (req, res) => {
  console.log('Submit solution endpoint called');
  
  try {
    // Get user ID from authentication middleware
    let userId = req.user?._id;
    if (!userId) {
      console.log('No user ID from auth middleware, using dummy ID');
      userId = new ObjectId("64a1b6c8f8c42a1b8bc0ef12"); // Dummy user ID for testing
    }
    
    console.log('User ID:', userId);
    
    const { problemId, code, language = 'cpp' } = req.body;
    
    console.log('Problem ID:', problemId);
    console.log('Language:', language);
    
    // Validate request
    if (!problemId || !code) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get test cases for the problem
    const testCases = getTestCases(problemId);
    
    if (testCases.length === 0) {
      console.log('No test cases found for this problem');
      return res.status(404).json({ error: 'No test cases found for this problem' });
    }
    
    // Create submission
    console.log('Creating submission record');
    const submission = new Submission({
      userId,
      problemId,
      code,
      language,
      status: 'pending'
    });
    
    // Save submission first
    console.log('Saving initial submission');
    await submission.save();
    
    let allPassed = true;
    const testResults = [];
    
    // Execute code for each test case
    console.log(`Running ${testCases.length} test cases`);
    for (const testCase of testCases) {
      console.log(`Processing test case ${testCase.id}`);
      const testCode = getTestCode(code, testCase.input, problemId, language);
      const filePath = generateFile(language, testCode);
      
      try {
        console.log(`Executing test case ${testCase.id}`);
        let output;
        
        if (language === 'cpp') {
          output = await executeCpp(filePath);
        } else if (language === 'java') {
          output = await executeJava(filePath);
        } else if (language === 'python') {
          output = await executePython(filePath);
        } else {
          // Default to C++
          output = await executeCpp(filePath);
        }
        
        console.log(`Output: "${output.trim()}", Expected: "${testCase.expected.trim()}"`)
        const passed = output.trim() === testCase.expected.trim();
        
        if (!passed) {
          console.log(`Test case ${testCase.id} failed`);
          allPassed = false;
        } else {
          console.log(`Test case ${testCase.id} passed`);
        }
        
        testResults.push({
          id: testCase.id,
          input: testCase.input,
          expected: testCase.expected,
          output: output.trim(),
          passed
        });
        
        cleanupFiles(filePath, language);
      } catch (error) {
        console.error(`Error executing test case ${testCase.id}:`, error);
        allPassed = false;
        testResults.push({
          id: testCase.id,
          input: testCase.input,
          expected: testCase.expected,
          output: error.stderr || "Execution error",
          passed: false
        });
        
        cleanupFiles(filePath, language);
      }
    }
    
    // Update submission with results
    console.log('Updating submission with test results');
    submission.status = allPassed ? 'accepted' : 'wrong_answer';
    submission.testCases = testResults;
    submission.output = testResults.map(r =>
      `Test Case ${r.id}: ${r.passed ? 'PASSED' : 'FAILED'}\nInput: ${r.input}\nExpected: ${r.expected}\nOutput: ${r.output}`
    ).join('\n\n');
    
    await submission.save();
    console.log('Submission updated');
    
    // Check if AI analysis is requested
    if (req.query.analyze === 'true') {
      try {
        console.log('AI analysis requested, generating code analysis');
        
        // Import the analyzeCode function
        const { analyzeCode } = require('../services/aiCodeAnalysis');
        
        // Generate AI analysis
        const analysis = await analyzeCode(code, language, problemId, allPassed);
        
        // Send response with analysis
        res.json({ 
          success: true, 
          submissionId: submission._id,
          status: submission.status,
          results: testResults,
          output: submission.output,
          analysis: analysis // Include AI analysis in response
        });
      } catch (analysisError) {
        console.error('Error generating AI analysis:', analysisError);
        
        // Send response without analysis due to error
        res.json({ 
          success: true, 
          submissionId: submission._id,
          status: submission.status,
          results: testResults,
          output: submission.output,
          analysisError: 'Failed to generate AI analysis'
        });
      }
    } else {
      // Standard response without analysis
      res.json({ 
        success: true, 
        submissionId: submission._id,
        status: submission.status,
        results: testResults,
        output: submission.output
      });
    }
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route: /api/code/custom-run
router.post('/custom-run', async (req, res) => {
  try {
    const { code, language = 'cpp', problemId, input = "" } = req.body;

    if (!code || !problemId) {
      return res.status(400).json({ error: "Code and problem ID are required" });
    }

    // Inject test code with main() dynamically
    const testCode = getTestCode(code, input, problemId, language);

    const filePath = generateFile(language, testCode);

    let output;
    if (language === "cpp") {
      output = await executeCpp(filePath);
    } else if (language === "java") {
      output = await executeJava(filePath);
    } else if (language === "python") {
      output = await executePython(filePath);
    } else {
      return res.status(400).json({ error: "Unsupported language" });
    }

    cleanupFiles(filePath, language);
    res.json({ output });

  } catch (error) {
    console.error('Custom run error:', error);
    res.status(500).json({ error: error.stderr || error.message || 'Execution failed' });
  }
});


module.exports = router;