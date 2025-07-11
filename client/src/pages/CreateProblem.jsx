import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateProblem = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [constraints, setConstraints] = useState('');
  const [testCases, setTestCases] = useState([{ input: '', output: '' }]);
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
    try {
      await axios.post('/api/problems', { title, description, difficulty, constraints, testCases }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      navigate('/problems');
    } catch (error) {
      console.error('Error creating problem:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Problem</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Constraints</label>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            className="w-full p-2 border rounded"
            required
          ></textarea>
        </div>
        
        <h2 className="text-xl font-bold mb-2">Test Cases</h2>
        {testCases.map((testCase, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Input</label>
              <textarea
                name="input"
                value={testCase.input}
                onChange={(e) => handleTestCaseChange(index, e)}
                className="w-full p-2 border rounded"
                required
              ></textarea>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Output</label>
              <textarea
                name="output"
                value={testCase.output}
                onChange={(e) => handleTestCaseChange(index, e)}
                className="w-full p-2 border rounded"
                required
              ></textarea>
            </div>
            <button type="button" onClick={() => removeTestCase(index)} className="bg-red-500 text-white px-2 py-1 rounded">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addTestCase} className="bg-gray-500 text-white px-4 py-2 rounded mb-4">
          Add Test Case
        </button>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Problem
        </button>
      </form>
    </div>
  );
};

export default CreateProblem;
