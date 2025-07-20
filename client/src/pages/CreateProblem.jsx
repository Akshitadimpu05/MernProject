import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateProblem = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [constraints, setConstraints] = useState('');
  const [testCases, setTestCases] = useState([{ input: '', output: '' }]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTestCaseChange = (index, e) => {
    const values = [...testCases];
    values[index][e.target.name] = e.target.value;
    setTestCases(values);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', output: '' }]);
  };

  const removeTestCase = (index) => {
    const values = [...testCases];
    values.splice(index, 1);
    setTestCases(values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate that there is at least one test case with both input and output
    const validTestCases = testCases.filter(tc => tc.input.trim() !== '' && tc.output.trim() !== '');
    if (validTestCases.length === 0) {
      setError('Please add at least one complete test case with input and output');
      return;
    }
    
    try {
      await axios.post('/api/problems', { 
        title, 
        description, 
        difficulty, 
        constraints, 
        testCases: validTestCases 
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      navigate('/problems');
    } catch (error) {
      console.error('Error creating problem:', error);
      setError(error.response?.data?.message || 'Failed to create problem');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-primary-pink mb-8 text-center">Create New Problem</h1>
        
        <div className="bg-dark-surface rounded-lg shadow-lg p-6 mb-8">
          {error && (
            <div className="bg-red-900 text-white p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-primary-pink text-sm font-medium mb-2">Problem Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink text-white"
            placeholder="Enter a descriptive title"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-primary-pink text-sm font-medium mb-2">Problem Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink text-white min-h-[150px]"
            placeholder="Describe the problem in detail, including examples and explanations"
            required
          ></textarea>
        </div>
        <div className="mb-6">
          <label className="block text-primary-pink text-sm font-medium mb-2">Difficulty Level</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-3 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink text-white"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <div className="flex mt-2 space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs ${difficulty === 'Easy' ? 'bg-green-600 text-white font-medium' : 'bg-gray-700 text-gray-300'}`}>Easy</span>
            <span className={`px-3 py-1 rounded-full text-xs ${difficulty === 'Medium' ? 'bg-yellow-600 text-white font-medium' : 'bg-gray-700 text-gray-300'}`}>Medium</span>
            <span className={`px-3 py-1 rounded-full text-xs ${difficulty === 'Hard' ? 'bg-red-600 text-white font-medium' : 'bg-gray-700 text-gray-300'}`}>Hard</span>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-primary-pink text-sm font-medium mb-2">Constraints</label>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            className="w-full p-3 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink text-white"
            placeholder="Specify time/space complexity requirements and input constraints"
            required
          ></textarea>
          <p className="text-text-secondary text-xs mt-1">Example: 1 ≤ n ≤ 10^5, Time complexity: O(n log n)</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-primary-pink">Test Cases</h2>
          <p className="text-text-secondary text-sm mb-4">Add test cases to validate solutions. Each test case should have input and expected output.</p>
          
          {testCases.map((testCase, index) => (
            <div key={index} className="mb-6 p-5 border border-gray-700 rounded-lg bg-dark-bg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-primary-pink">Test Case #{index + 1}</h3>
                <button 
                  type="button" 
                  onClick={() => removeTestCase(index)} 
                  className="bg-red-900 hover:bg-red-800 text-white px-3 py-1 rounded-md text-sm transition-colors"
                  disabled={testCases.length === 1}
                >
                  Remove
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-primary-pink text-sm font-medium mb-2">Input</label>
                <textarea
                  name="input"
                  value={testCase.input}
                  onChange={(e) => handleTestCaseChange(index, e)}
                  className="w-full p-3 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink text-white font-mono"
                  placeholder="Enter test case input"
                  required
                  rows="3"
                ></textarea>
              </div>
              
              <div className="mb-2">
                <label className="block text-primary-pink text-sm font-medium mb-2">Expected Output</label>
                <textarea
                  name="output"
                  value={testCase.output}
                  onChange={(e) => handleTestCaseChange(index, e)}
                  className="w-full p-3 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink text-white font-mono"
                  placeholder="Enter expected output"
                  required
                  rows="3"
                ></textarea>
              </div>
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={addTestCase} 
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors flex items-center mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Test Case
          </button>
        </div>

        <div className="flex justify-between mt-8">
          <button 
            type="button" 
            onClick={() => navigate('/admin')} 
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="bg-primary-pink hover:bg-secondary-pink text-white px-8 py-3 rounded-md transition-colors font-medium"
          >
            Create Problem
          </button>
        </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProblem;
