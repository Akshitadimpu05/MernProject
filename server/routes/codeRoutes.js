const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const Submission = require('../models/Submission');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Helper function to generate file
function generateFile(language, code) {
  const tempDir = path.join(__dirname, '..', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const fileName = `code_${Date.now()}.${language === 'cpp' ? 'cpp' : language}`;
  const filePath = path.join(tempDir, fileName);

  fs.writeFileSync(filePath, code);
  return filePath;
}

// Helper function to execute C++ code
async function executeCpp(filePath) {
  const jobId = path.basename(filePath).split(".")[0];
  const outputPath = path.join(__dirname, '..', 'outputs');
  
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  const outFile = process.platform === "win32"
    ? `${jobId}.exe`
    : `${jobId}.out`;
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

// Helper function to clean up temporary files
function cleanupFiles(filePath) {
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
}

// Function to get test cases for a problem
function getTestCases(problemId) {
  console.log(`Getting test cases for problem ${problemId}`);
  
  // In a real application, you would fetch these from a database
  // For now, we'll hardcode sample test cases for each problem
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
  
  const testCases = testCasesMap[problemId] || [];
  console.log(`Found ${testCases.length} test cases`);
  return testCases;
}

// Function to modify code for test input
function getTestCode(code, input, problemId) {
  console.log(`Generating test code for problem ${problemId} with input ${input}`);
  
  try {
    if (problemId === '1') {
      // Two Sum problem - expects array and target
      // Parse the input string - format: {array}, target
      const inputParts = input.split('},');
      if (inputParts.length !== 2) {
        throw new Error('Invalid input format');
      }
      
      let numsStr = inputParts[0].trim();
      if (numsStr.startsWith('{')) {
        numsStr = numsStr.substring(1);
      }
      
      const targetStr = inputParts[1].trim();
      
      // Create a modified main function that uses the test case input
      const newMain = `
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
      
      // Replace the original main function
      const mainRegex = /int\s+main\s*\(\s*\)\s*{[\s\S]*?return\s+0\s*;\s*}/g;
      const modifiedCode = code.replace(mainRegex, newMain);
      
      console.log("Generated test code for Two Sum problem");
      return modifiedCode;
    } else if (problemId === '2') {
      // Add Two Numbers problem - more complex, needs ListNode construction
      const listRegex = /\[([\d,\s]+)\]/g;
      const matches = [...input.matchAll(listRegex)];
      
      if (matches.length !== 2) {
        throw new Error('Invalid input format for Add Two Numbers');
      }
      
      const list1Values = matches[0][1].split(',').map(n => n.trim());
      const list2Values = matches[1][1].split(',').map(n => n.trim());
      
      // Generate code to create the linked lists
      let listNodesCode = '';
      
      // First list creation
      listNodesCode += 'ListNode* l1 = nullptr;\n';
      listNodesCode += 'ListNode* curr1 = nullptr;\n';
      
      list1Values.forEach((val, idx) => {
        if (idx === 0) {
          listNodesCode += `l1 = new ListNode(${val});\n`;
          listNodesCode += `curr1 = l1;\n`;
        } else {
          listNodesCode += `curr1->next = new ListNode(${val});\n`;
          listNodesCode += `curr1 = curr1->next;\n`;
        }
      });
      
      // Second list creation
      listNodesCode += 'ListNode* l2 = nullptr;\n';
      listNodesCode += 'ListNode* curr2 = nullptr;\n';
      
      list2Values.forEach((val, idx) => {
        if (idx === 0) {
          listNodesCode += `l2 = new ListNode(${val});\n`;
          listNodesCode += `curr2 = l2;\n`;
        } else {
          listNodesCode += `curr2->next = new ListNode(${val});\n`;
          listNodesCode += `curr2 = curr2->next;\n`;
        }
      });
      
      const newMain = `
int main() {
    Solution sol;
    
    // Create lists from test input
    ${listNodesCode}
    
    // Call the solution function
    ListNode* result = sol.addTwoNumbers(l1, l2);
    
    // Output the result
    while (result) {
        cout << result->val << " ";
        result = result->next;
    }
    
    return 0;
}`;
      
      // Replace the original main function
      const mainRegex = /int\s+main\s*\(\s*\)\s*{[\s\S]*?return\s+0\s*;\s*}/g;
      const modifiedCode = code.replace(mainRegex, newMain);
      
      console.log("Generated test code for Add Two Numbers problem");
      return modifiedCode;
    }
    
    // Default case - return original code
    console.log("No specific test code generator for this problem, using original code");
    return code;
  } catch (error) {
    console.error('Error generating test code:', error);
    return code; // Return original code if there's an error
  }
}

// Run code endpoint
router.post('/run', async (req, res) => {
  console.log('Run code endpoint called');
  
  try {
    const { code, language = 'cpp' } = req.body;
    
    if (!code) {
      console.log('No code provided');
      return res.status(400).json({ error: "Code is required" });
    }
    
    console.log('Generating file for code execution');
    const filePath = generateFile(language, code);
    
    try {
      console.log('Executing code');
      const output = await executeCpp(filePath);
      console.log('Code executed successfully');
      cleanupFiles(filePath);
      res.json({ output });
    } catch (err) {
      console.error('Error during code execution:', err);
      cleanupFiles(filePath);
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

// Execute code with test cases endpoint
router.post('/execute', async (req, res) => {
  console.log('Execute code endpoint called');
  
  try {
    const { problemId, code, language = 'cpp' } = req.body;
    
    // Validate request
    if (!code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // For simplicity, we'll just run the code as is
    const filePath = generateFile(language, code);
    
    try {
      const output = await executeCpp(filePath);
      cleanupFiles(filePath);
      res.json({ output });
    } catch (err) {
      cleanupFiles(filePath);
      res.status(500).json({ error: err.stderr || "Execution error" });
    }
  } catch (error) {
    console.error('Error in execute endpoint:', error);
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
      const testCode = getTestCode(code, testCase.input, problemId);
      const filePath = generateFile(language, testCode);
      
      try {
        console.log(`Executing test case ${testCase.id}`);
        const output = await executeCpp(filePath);
        console.log(`Output: "${output.trim()}", Expected: "${testCase.expected.trim()}"`);
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
        
        cleanupFiles(filePath);
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
        
        cleanupFiles(filePath);
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
    
    res.json({ 
      success: true, 
      submissionId: submission._id,
      status: submission.status,
      results: testResults,
      output: submission.output
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;