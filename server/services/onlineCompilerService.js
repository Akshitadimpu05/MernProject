const axios = require('axios');

/**
 * Execute code using the Judge0 API
 * @param {string} code - The source code to execute
 * @param {string} language - The programming language (cpp, java, python)
 * @param {string} input - The input for the program
 * @returns {Promise<Object>} - The execution result
 */
async function executeCodeOnline(code, language, input = '') {
  try {
    // Map our language codes to Judge0 language IDs
    const languageMap = {
      'cpp': 54,    // C++ (GCC 9.2.0)
      'java': 62,   // Java (OpenJDK 13.0.1)
      'python': 71  // Python (3.8.1)
    };
    
    const languageId = languageMap[language] || 54; // Default to C++ if language not found
    
    // Use the free Judge0 API (rate limited but works for demo)
    const apiUrl = 'https://judge0-ce.p.rapidapi.com/submissions';
    
    // Create submission
    const createResponse = await axios({
      method: 'POST',
      url: apiUrl,
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '1b2e24d2e0msh3c7c8d369e3ea52p1c9e3bjsn3f408b4b53a9',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      data: {
        source_code: code,
        language_id: languageId,
        stdin: input,
        redirect_stderr_to_stdout: true
      }
    });
    
    const token = createResponse.data.token;
    
    // Wait for the submission to be processed
    let result;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Wait a bit before checking the result
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the submission result
      const resultResponse = await axios({
        method: 'GET',
        url: `${apiUrl}/${token}`,
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '1b2e24d2e0msh3c7c8d369e3ea52p1c9e3bjsn3f408b4b53a9',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        params: {
          base64_encoded: 'false',
          fields: 'stdout,stderr,status,compile_output,message,time,memory'
        }
      });
      
      result = resultResponse.data;
      
      // Check if the submission is finished
      if (result.status && result.status.id >= 3) {
        break;
      }
    }
    
    // Format the output
    let output = '';
    
    if (result.compile_output && result.compile_output.trim()) {
      output = `Compilation Error: ${result.compile_output}`;
    } else if (result.stderr && result.stderr.trim()) {
      output = `Error: ${result.stderr}`;
    } else if (result.stdout) {
      output = result.stdout;
    } else if (result.message) {
      output = `Message: ${result.message}`;
    } else {
      output = 'No output generated';
    }
    
    return output;
  } catch (error) {
    console.error('Online compiler error:', error.message);
    throw new Error(`Failed to execute code online: ${error.message}`);
  }
}

module.exports = { executeCodeOnline };
