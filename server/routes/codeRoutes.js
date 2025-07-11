const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const Submission = require('../models/Submission');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { executeJava, cleanupJava } = require('../utils/executeJava.js');
const { analyzeCode } = require('../services/aiCodeAnalysis');
const { protect } = require('../middlewares/authMiddleware');

function generateFile(language, code) {
  const tempDir = path.join(__dirname, '..', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  let extension = 'cpp';
  if (language === 'java') extension = 'java';
  if (language === 'python') extension = 'py';
  // Use consistent Java filename
  const fileName = language === 'java' ? 
    'Solution.java' : `code_${Date.now()}.${extension}`;
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

// Function to get test cases for all problems
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
    ],
    '3': [ // Longest Substring
      { 
        id: '1', 
        input: '["abcabcbb"]', 
        expected: '3' 
      },
      { 
        id: '2', 
        input: '["bbbbb"]', 
        expected: '1' 
      },
      { 
        id: '3', 
        input: '["pwwkew"]', 
        expected: '3' 
      }
    ],
    '4': [ // Valid Anagram
      { 
        id: '1', 
        input: '["anagram", "nagaram"]', 
        expected: 'true' 
      },
      { 
        id: '2', 
        input: '["rat", "car"]', 
        expected: 'false' 
      },
      { 
        id: '3', 
        input: '["listen", "silent"]', 
        expected: 'true' 
      }
    ],
    '5': [ // Reverse String
      { 
        id: '1', 
        input: '["hello"]', 
        expected: '["olleh"]' 
      },
      { 
        id: '2', 
        input: '["world"]', 
        expected: '["dlrow"]' 
      },
      { 
        id: '3', 
        input: '["racecar"]', 
        expected: '["racecar"]' 
      }
    ],
    '6': [ // Valid Palindrome
      { 
        id: '1', 
        input: '["A man, a plan, a canal: Panama"]', 
        expected: 'true' 
      },
      { 
        id: '2', 
        input: '["race a car"]', 
        expected: 'false' 
      },
      { 
        id: '3', 
        input: '[""]', 
        expected: 'true' 
      }
    ],
    '7': [ // Palindrome Number
      { 
        id: '1', 
        input: '[121]', 
        expected: 'true' 
      },
      { 
        id: '2', 
        input: '[-121]', 
        expected: 'false' 
      },
      { 
        id: '3', 
        input: '[10]', 
        expected: 'false' 
      }
    ],
    '8': [ // Permutations
      { 
        id: '1', 
        input: '[1,2,3]', 
        expected: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' 
      },
      { 
        id: '2', 
        input: '[0,1]', 
        expected: '[[0,1],[1,0]]' 
      },
      { 
        id: '3', 
        input: '[1]', 
        expected: '[[1]]' 
      }
    ]
  };
  
  const result = testCasesMap[problemId] || [];
  console.log(`Retrieved ${result.length} test cases for problem ${problemId}`);
  return result;
}

// ================= C++ TEST CODE GENERATION =================
// Two Sum
function getCppTwoSumTestCode(code, input) {
  try {
    console.log(`Generating C++ Two Sum test code for input: ${input}`);
    
    // Handle various input formats
    let numsStr = '';
    let targetStr = '';
    
    if (input.includes('[') && input.includes(']')) {
      // Format: [2,7,11,15], 9
      const parts = input.split('],');
      if (parts.length === 2) {
        numsStr = parts[0].replace('[', '').trim();
        targetStr = parts[1].trim();
      }
    } else if (input.includes('{') && input.includes('}')) {
      // Format: {2, 7, 11, 15}, 9
      const parts = input.split('},');
      if (parts.length === 2) {
        numsStr = parts[0].replace('{', '').trim();
        targetStr = parts[1].trim();
      }
    } else {
      // Format: 2,7,11,15, 9
      const parts = input.split(',');
      if (parts.length > 1) {
        const lastPart = parts.pop();
        targetStr = lastPart.trim();
        numsStr = parts.join(',').trim();
      }
    }
    
    console.log(`Parsed: nums=[${numsStr}], target=${targetStr}`);
    
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

// Add Two Numbers
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

// Longest Substring
function getCppLongestSubstringTestCode(code, input) {
  // Fix: Properly format the string input
  const formattedInput = input.replace(/\[|\]/g,'').replace(/"/g, '\\"');
  
  const testCode = `
#include <iostream>
#include <vector>
#include <string>
using namespace std;
${code}
int main() {
    vector<string> v = {"${formattedInput}"};
    string s = v[0];
    cout << Solution().lengthOfLongestSubstring(s) << endl;
    return 0;
}
`;
  return testCode;
}

// Valid Anagram
function getCppAnagramTestCode(code, input) {
  // Fix: Properly format the string input
  const matches = input.match(/\["([^"]+)"\s*,\s*"([^"]+)"\]/);
  let s = '', t = '';
  
  if (matches && matches.length >= 3) {
    s = matches[1];
    t = matches[2];
  }
  
  const testCode = `
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
using namespace std;
${code}
int main() {
    string s = "${s}";
    string t = "${t}";
    cout << (Solution().isAnagram(s, t) ? "true" : "false") << endl;
    return 0;
}
`;
  return testCode;
}

// Reverse String
function getCppReverseStringTestCode(code, input) {
  const matches = input.match(/\["([^"]+)"\]/);
  let s = '';
  
  if (matches && matches.length >= 2) {
    s = matches[1];
  }

  const testCode = `
#include <iostream>
#include <vector>
#include <string>
using namespace std;
${code}
int main() {
    string input = "${s}";
    vector<char> s(input.begin(), input.end());
    Solution().reverseString(s);
    cout << "[\\"";
    for (char c : s) {
        cout << c;
    }
    cout << "\\"]" << endl;
    return 0;
}
`;
  return testCode;
}

// Valid Palindrome
function getCppPalindromeTestCode(code, input) {
  // Fix: Properly format the string input
  const matches = input.match(/\["([^"]*)"\]/);
  let s = '';
  
  if (matches && matches.length >= 2) {
    s = matches[1].replace(/"/g, '\\"'); // Escape quotes in the string
  }
  
  const testCode = `
#include <iostream>
#include <vector>
#include <string>
using namespace std;
${code}
int main() {
    string s = "${s}";
    cout << (Solution().isPalindrome(s) ? "true" : "false") << endl;
    return 0;
}
`;
  return testCode;
}

// Palindrome Number
function getCppPalindromeNumberTestCode(code, input) {
  // Fix: Extract the number from the input
  const matches = input.match(/\[(-?\d+)\]/);
  let num = 0;
  
  if (matches && matches.length >= 2) {
    num = parseInt(matches[1]);
  }
  
  const testCode = `
#include <iostream>
#include <vector>
#include <string>
using namespace std;
${code}
int main() {
    int x = ${num};
    cout << (Solution().isPalindrome(x) ? "true" : "false") << endl;
    return 0;
}
`;
  return testCode;
}

// Permutations
function getCppPermutationsTestCode(code, input) {
  // Fix: Extract numbers from the input
  const matches = input.match(/\[([\d,]+)\]/);
  let nums = [];
  
  if (matches && matches.length >= 2) {
    nums = matches[1].split(',').map(n => parseInt(n.trim()));
  }
  
  const numsStr = nums.join(', ');
  
  const testCode = `
#include <iostream>
#include <vector>
#include <string>
using namespace std;
${code}
int main() {
    vector<int> nums = {${numsStr}};
    vector<vector<int>> result = Solution().permute(nums);
    
    cout << "[";
    for (size_t i = 0; i < result.size(); ++i) {
        cout << "[";
        for (size_t j = 0; j < result[i].size(); ++j) {
            cout << result[i][j];
            if (j < result[i].size() - 1) cout << ",";
        }
        cout << "]";
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    
    return 0;
}
`;
  return testCode;
}

// ================= JAVA TEST CODE GENERATION =================
// Two Sum - Java
function getJavaTwoSumTestCode(code, input) {
  try {
    console.log(`Generating Java Two Sum test code for input: ${input}`);
    // Skip if main already exists
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

// Add Two Numbers - Java
function getJavaAddTwoNumbersTestCode(code, input) {
  try {
    console.log(`Generating Java Add Two Numbers test code for input: ${input}`);
    // Skip if main already exists
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

// Longest Substring - Java
function getJavaLongestSubstringTestCode(code, input) {
  if (/public\s+static\s+void\s+main\s*\(/.test(code)) {
    return code;
  }
  
  // Extract the string from input
  const matches = input.match(/\["([^"]*)"\]/);
  let s = '';
  
  if (matches && matches.length >= 2) {
    s = matches[1];
  }
  
  const mainMethod = `
    public static void main(String[] args) {
        Solution sol = new Solution();
        String s = "${s}";
        System.out.println(sol.lengthOfLongestSubstring(s));
    }`;
    
  const lastBrace = code.lastIndexOf('}');
  if (lastBrace !== -1) {
    return code.slice(0, lastBrace) + mainMethod + '\n}';
  }
  return code + '\n' + mainMethod;
}

// Valid Anagram - Java
function getJavaAnagramTestCode(code, input) {
  if (/public\s+static\s+void\s+main\s*\(/.test(code)) {
    return code;
  }
  
  // Extract the strings from input
  const matches = input.match(/\["([^"]+)"\s*,\s*"([^"]+)"\]/);
  let s = '', t = '';
  
  if (matches && matches.length >= 3) {
    s = matches[1];
    t = matches[2];
  }
  
  const mainMethod = `
    public static void main(String[] args) {
        Solution sol = new Solution();
        String s = "${s}";
        String t = "${t}";
        System.out.println(sol.isAnagram(s, t));
    }`;
    
  const lastBrace = code.lastIndexOf('}');
  if (lastBrace !== -1) {
    return code.slice(0, lastBrace) + mainMethod + '\n}';
  }
  return code + '\n' + mainMethod;
}

// Reverse String - Java
function getJavaReverseStringTestCode(code, input) {
  if (/public\s+static\s+void\s+main\s*\(/.test(code)) return code;

  const matches = input.match(/\["([^"]+)"\]/);
  let s = matches?.[1] || "";

  const mainMethod = `
    public static void main(String[] args) {
        Solution sol = new Solution();
        char[] s = "${s}".toCharArray();
        sol.reverseString(s);
        System.out.print("[\\\"");
        for (char c : s) {
            System.out.print(c);
        }
        System.out.println("\\\"]");
    }`;

  const lastBrace = code.lastIndexOf('}');
  return lastBrace !== -1 ? code.slice(0, lastBrace) + mainMethod + '\n}' : code + '\n' + mainMethod;
}

// Valid Palindrome - Java
function getJavaPalindromeTestCode(code, input) {
  if (/public\s+static\s+void\s+main\s*\(/.test(code)) {
    return code;
  }
  
  // Extract the string from input
  const matches = input.match(/\["([^"]*)"\]/);
  let s = '';
  
  if (matches && matches.length >= 2) {
    s = matches[1];
  }
  
  const mainMethod = `
    public static void main(String[] args) {
        Solution sol = new Solution();
        String s = "${s}";
        System.out.println(sol.isPalindrome(s));
    }`;
    
  const lastBrace = code.lastIndexOf('}');
  if (lastBrace !== -1) {
    return code.slice(0, lastBrace) + mainMethod + '\n}';
  }
  return code + '\n' + mainMethod;
}

// Palindrome Number - Java
function getJavaPalindromeNumberTestCode(code, input) {
  if (/public\s+static\s+void\s+main\s*\(/.test(code)) {
    return code;
  }
  
  // Extract the number from input
  const matches = input.match(/\[(-?\d+)\]/);
  let num = 0;
  
  if (matches && matches.length >= 2) {
    num = parseInt(matches[1]);
  }
  
  const mainMethod = `
    public static void main(String[] args) {
        Solution sol = new Solution();
        int x = ${num};
        System.out.println(sol.isPalindrome(x));
    }`;
    
  const lastBrace = code.lastIndexOf('}');
  if (lastBrace !== -1) {
    return code.slice(0, lastBrace) + mainMethod + '\n}';
  }
  return code + '\n' + mainMethod;
}

// Permutations - Java
function getJavaPermutationsTestCode(code, input) {
  if (/public\s+static\s+void\s+main\s*\(/.test(code)) {
    return code;
  }
  
  // Extract the numbers from input
  const matches = input.match(/\[([\d,]+)\]/);
  let nums = [];
  
  if (matches && matches.length >= 2) {
    nums = matches[1].split(',').map(n => parseInt(n.trim()));
  }
  
  const mainMethod = `
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = {${nums.join(', ')}};
        
        List<List<Integer>> result = sol.permute(nums);
        
        // Print the result
        System.out.print("[");
        for (int j = 0; j < result.size(); j++) {
            System.out.print("[");
            for (int k = 0; k < result.get(j).size(); k++) {
                System.out.print(result.get(j).get(k));
                if (k < result.get(j).size() - 1) {
                    System.out.print(",");
                }
            }
            System.out.print("]");
            if (j < result.size() - 1) {
                System.out.print(",");
            }
        }
        System.out.println("]");
    }`;
    
  const lastBrace = code.lastIndexOf('}');
  if (lastBrace !== -1) {
    return code.slice(0, lastBrace) + mainMethod + '\n}';
  }
  return code + '\n' + mainMethod;
}

// ================= PYTHON TEST CODE GENERATION =================
// Two Sum - Python
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

// Add Two Numbers - Python
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

// Longest Substring - Python
function getPythonLongestSubstringTestCode(code, input) {
  // Extract the string from input
  const matches = input.match(/\["([^"]*)"\]/);
  let s = '';
  
  if (matches && matches.length >= 2) {
    s = matches[1];
  }
  
  const mainBlock = `
if __name__ == "__main__":
    sol = Solution()
    s = "${s}"
    print(sol.lengthOfLongestSubstring(s))`;
    
  if (code.includes('if __name__ == "__main__"')) {
    return code.replace(/if\s+__name__\s*==\s*"__main__"[\s\S]*?(?=\n\S|$)/, mainBlock);
  } else {
    return code + '\n' + mainBlock;
  }
}

// Valid Anagram - Python
function getPythonAnagramTestCode(code, input) {
  // Extract the strings from input
  const matches = input.match(/\["([^"]+)"\s*,\s*"([^"]+)"\]/);
  let s = '', t = '';
  
  if (matches && matches.length >= 3) {
    s = matches[1];
    t = matches[2];
  }
  
  const mainBlock = `
if __name__ == "__main__":
    sol = Solution()
    s = "${s}"
    t = "${t}"
    print(str(sol.isAnagram(s, t)).lower())`;
  
  if (code.includes('if __name__ == "__main__"')) {
    return code.replace(/if\s+__name__\s*==\s*"__main__"[\s\S]*?(?=\n\S|$)/, mainBlock);
  } else {
    return code + '\n' + mainBlock;
  }
}

//Reverse-String Python
function getPythonReverseStringTestCode(code, input) {
  const matches = input.match(/\["([^"]+)"\]/);
  let s = '';
  if (matches && matches.length >= 2) {
    s = matches[1];
  }

  const charArray = s.split('').map(c => `"${c}"`).join(', ');

  const mainBlock = `
if __name__ == "__main__":
    sol = Solution()
    s = [${charArray}]
    sol.reverseString(s)
    print('["' + ''.join(s) + '"]')`;

  if (code.includes('if __name__ == "__main__"')) {
    return code.replace(/if\s+__name__\s*==\s*"__main__"[\s\S]*?(?=\n\S|$)/, mainBlock);
  } else {
    return code + '\n' + mainBlock;
  }
}

// Valid Palindrome - Python
function getPythonPalindromeTestCode(code, input) {
  // Extract the string from input
  const matches = input.match(/\["([^"]*)"\]/);
  let s = '';
  
  if (matches && matches.length >= 2) {
    s = matches[1];
  }
  
  const mainBlock = `
if __name__ == "__main__":
    sol = Solution()
    s = "${s}"
    print(str(sol.isPalindrome(s)).lower())`;
    
  if (code.includes('if __name__ == "__main__"')) {
    return code.replace(/if\s+__name__\s*==\s*"__main__"[\s\S]*?(?=\n\S|$)/, mainBlock);
  } else {
    return code + '\n' + mainBlock;
  }
}

// Palindrome Number - Python
function getPythonPalindromeNumberTestCode(code, input) {
  // Extract the number from input
  const matches = input.match(/\[(-?\d+)\]/);
  let num = 0;
  
  if (matches && matches.length >= 2) {
    num = parseInt(matches[1]);
  }
  
  const mainBlock = `
if __name__ == "__main__":
    sol = Solution()
    x = ${num}
    print(str(sol.isPalindrome(x)).lower())`;
    
  if (code.includes('if __name__ == "__main__"')) {
    return code.replace(/if\s+__name__\s*==\s*"__main__"[\s\S]*?(?=\n\S|$)/, mainBlock);
  } else {
    return code + '\n' + mainBlock;
  }
}

// Permutations - Python
function getPythonPermutationsTestCode(code, input) {
  // Extract the numbers from input
  const matches = input.match(/\[([\d,]+)\]/);
  let nums = [];
  
  if (matches && matches.length >= 2) {
    nums = matches[1].split(',').map(n => parseInt(n.trim()));
  }
  
  const mainBlock = `
if __name__ == "__main__":
    sol = Solution()
    nums = [${nums.join(', ')}]
    result = sol.permute(nums)
    
    # Print result
    print(str(result).replace(' ', ''))`;
    
  if (code.includes('if __name__ == "__main__"')) {
    return code.replace(/if\s+__name__\s*==\s*"__main__"[\s\S]*?(?=\n\S|$)/, mainBlock);
  } else {
    return code + '\n' + mainBlock;
  }
}

// ================= LANGUAGE-SPECIFIC TEST CODE SELECTORS =================
// C++ Test Code Selector
function getCppTestCode(code, input, problemId) {
  switch (problemId) {
    case '1':
      return getCppTwoSumTestCode(code, input);
    case '2':
      return getCppAddTwoNumbersTestCode(code, input);
    case '3':
      return getCppLongestSubstringTestCode(code, input);
    case '4':
      return getCppAnagramTestCode(code, input);
    case '5':
      return getCppReverseStringTestCode(code, input);
    case '6':
      return getCppPalindromeTestCode(code, input);
    case '7':
      return getCppPalindromeNumberTestCode(code, input);
    case '8':
      return getCppPermutationsTestCode(code, input);
    default:
      return code;
  }
}

// Java Test Code Selector
function getJavaTestCode(code, input, problemId) {
  switch (problemId) {
    case '1':
      return getJavaTwoSumTestCode(code, input);
    case '2':
      return getJavaAddTwoNumbersTestCode(code, input);
    case '3':
      return getJavaLongestSubstringTestCode(code, input);
    case '4':
      return getJavaAnagramTestCode(code, input);
    case '5':
      return getJavaReverseStringTestCode(code, input);
    case '6':
      return getJavaPalindromeTestCode(code, input);
    case '7':
      return getJavaPalindromeNumberTestCode(code, input);
    case '8':
      return getJavaPermutationsTestCode(code, input);
    default:
      return code;
  }
}

// Python Test Code Selector
function getPythonTestCode(code, input, problemId) {
  switch (problemId) {
    case '1':
      return getPythonTwoSumTestCode(code, input);
    case '2':
      return getPythonAddTwoNumbersTestCode(code, input);
    case '3':
      return getPythonLongestSubstringTestCode(code, input);
    case '4':
      return getPythonAnagramTestCode(code, input);
    case '5':
      return getPythonReverseStringTestCode(code, input);
    case '6':
      return getPythonPalindromeTestCode(code, input);
    case '7':
      return getPythonPalindromeNumberTestCode(code, input);
    case '8':
      return getPythonPermutationsTestCode(code, input);
    default:
      return code;
  }
}

// ================= UNIFIED TEST CODE GENERATOR =================
// Function to generate appropriate test code based on language and problem
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

// ================= INPUT FORMATTING =================
// Helper function to format custom input based on problem type
function formatCustomInput(input, problemId) {
  // Default format for most problems
  let formattedInput = `["${input}"]`;
  
  const problemId_num = parseInt(problemId);
  
  // Special formatting for different problems
  switch (problemId_num) {
    case 1: // Two Sum
      // Expected format: [2,7,11,15], 9
      if (!input.includes(',')) {
        // If no comma, assume it's just numbers
        formattedInput = input;
      } else if (!input.includes('],')) {
        // If no proper array format, try to fix it
        const parts = input.split(',');
        const lastPart = parts.pop();
        formattedInput = `[${parts.join(',')}], ${lastPart}`;
      } else {
        formattedInput = input;
      }
      break;
    
    case 2: // Add Two Numbers
      // Expected format: [2,4,3], [5,6,4]
      formattedInput = input;
      break;
      
    case 3: // Longest Substring
      // Format properly to handle string with special characters
      if (!input.startsWith('[') && !input.endsWith(']')) {
        formattedInput = `["${input}"]`;
      } else {
        formattedInput = input;
      }
      break;
      
    case 4: // Anagram
      // Expected format: ["anagram", "nagaram"]
      if (input.includes(',')) {
        const parts = input.split(',').map(part => part.trim());
        if (parts.length >= 2) {
          formattedInput = `["${parts[0]}", "${parts[1]}"]`;
        }
      }
      break;
      
    // For other problems, use the default formatting
  }
  
  console.log(`Formatted input: ${formattedInput}`);
  return formattedInput;
}

// ================= API ENDPOINTS =================
// Run code endpoint
router.post('/run', protect, async (req, res) => {
  console.log('Run code endpoint called');
  
  try {
    const { problemId, code, language = 'cpp' } = req.body;
    
    if (!problemId || !code) {
      return res.status(400).json({ error: 'Problem ID and code are required' });
    }
    
    // Get test cases for the problem
    const testCases = getTestCases(problemId);
    console.log(`Retrieved ${testCases.length} test cases for problem ${problemId}`);
    
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ error: 'No test cases found for this problem' });
    }
    
    const firstTestCase = testCases[0];
    const input = firstTestCase?.input || '[]';
    
    // Generate test code based on problem ID and language
    const testCode = getTestCode(code, input, problemId, language);
    
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
        return res.status(400).json({ error: 'Unsupported language' });
      }
      
      await cleanupFiles(filePath, language);
      res.json({ output });
    } catch (error) {
      console.error('Execution error:', error);
      res.status(500).json({ error: error.message || 'Execution failed' });
    }
  } catch (error) {
    console.error('Run error:', error);
    res.status(500).json({ error: error.message || 'Undefined Error' });
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
router.post('/submit', protect, async (req, res) => {
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
router.post('/custom-run', protect, async (req, res) => {
  try {
    const { code, language = 'cpp', problemId, input: customInput = "" } = req.body;
    
    if (!code || !problemId) {
      return res.status(400).json({ error: "Code and problem ID are required" });
    }
    
    // Get test cases only to verify problem validity
    const testCases = getTestCases(problemId);
    
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ error: 'No test cases found for this problem' });
    }
    
    console.log(`Processing custom input for problem ${problemId}: ${customInput}`);
    
    // Format custom input appropriately for the problem
    const formattedInput = formatCustomInput(customInput, problemId);
    console.log(`Formatted input: ${formattedInput}`);
    
    // Generate test code
    const testCode = getTestCode(code, formattedInput, problemId, language);
    
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
        return res.status(400).json({ error: 'Unsupported language' });
      }
      
      await cleanupFiles(filePath, language);
      res.json({ output });
    } catch (error) {
      console.error('Execution error:', error);
      res.status(500).json({ error: error.message || 'Execution failed' });
    }
  } catch (error) {
    console.error('Custom run error:', error);
    res.status(500).json({ error: error.message || 'Undefined Error' });
  }
});

module.exports = router;