import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../auth/auth';

const ProblemEditModal = ({ problem, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    constraints: '',
    examples: [],
    testCases: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (problem) {
      setFormData({
        title: problem.title || '',
        description: problem.description || '',
        difficulty: problem.difficulty || 'Easy',
        constraints: problem.constraints || '',
        examples: problem.examples || [],
        testCases: problem.testCases || []
      });
    }
  }, [problem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExampleChange = (index, field, value) => {
    const updatedExamples = [...formData.examples];
    if (!updatedExamples[index]) {
      updatedExamples[index] = { input: '', output: '', explanation: '' };
    }
    updatedExamples[index][field] = value;
    setFormData(prev => ({
      ...prev,
      examples: updatedExamples
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...formData.testCases];
    if (!updatedTestCases[index]) {
      updatedTestCases[index] = { input: '', output: '' };
    }
    updatedTestCases[index][field] = value;
    setFormData(prev => ({
      ...prev,
      testCases: updatedTestCases
    }));
  };

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }));
  };

  const removeExample = (index) => {
    const updatedExamples = [...formData.examples];
    updatedExamples.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      examples: updatedExamples
    }));
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', output: '' }]
    }));
  };

  const removeTestCase = (index) => {
    const updatedTestCases = [...formData.testCases];
    updatedTestCases.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      testCases: updatedTestCases
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (problem && problem._id) {
        // Update existing problem
        response = await axios.put(`/api/problems/${problem._id}`, formData, {
          headers: { Authorization: `Bearer ${auth.getToken()}` }
        });
      } else {
        // Create new problem
        response = await axios.post('/api/problems', formData, {
          headers: { Authorization: `Bearer ${auth.getToken()}` }
        });
      }
      
      setLoading(false);
      onSave(response.data);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred while saving the problem');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-pink">
              {problem && problem._id ? 'Edit Problem' : 'Create New Problem'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-900 text-white p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-pink"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-pink"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-pink"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Constraints</label>
              <textarea
                name="constraints"
                value={formData.constraints}
                onChange={handleChange}
                rows="3"
                className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-pink"
              ></textarea>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Examples</label>
                <button
                  type="button"
                  onClick={addExample}
                  className="px-3 py-1 bg-primary-pink hover:bg-secondary-pink text-white rounded-md text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Example
                </button>
              </div>
              
              {formData.examples.map((example, index) => (
                <div key={index} className="bg-dark-bg border border-gray-700 rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-primary-pink">Example {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Input</label>
                      <textarea
                        value={example.input || ''}
                        onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                        rows="2"
                        className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-pink"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Output</label>
                      <textarea
                        value={example.output || ''}
                        onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                        rows="2"
                        className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-pink"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Explanation</label>
                    <textarea
                      value={example.explanation || ''}
                      onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                      rows="2"
                      className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-pink"
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Test Cases</label>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="px-3 py-1 bg-primary-pink hover:bg-secondary-pink text-white rounded-md text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Test Case
                </button>
              </div>
              
              {formData.testCases.map((testCase, index) => (
                <div key={index} className="bg-dark-bg border border-gray-700 rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-primary-pink">Test Case {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Input</label>
                      <textarea
                        value={testCase.input || ''}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        rows="2"
                        className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-pink"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Expected Output</label>
                      <textarea
                        value={testCase.output || ''}
                        onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                        rows="2"
                        className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-pink"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-pink hover:bg-secondary-pink text-white rounded-md transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Problem'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProblemEditModal;
