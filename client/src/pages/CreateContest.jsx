import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateContest = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axios.get('/api/problems', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate that at least one problem is selected
    if (selectedProblems.length === 0) {
      setError('Please select at least one problem');
      return;
    }
    
    // Validate that end time is after start time
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    if (endDate <= startDate) {
      setError('End time must be after start time');
      return;
    }
    
    try {
      // Use the raw ISO string to avoid timezone issues
      await axios.post('/api/contests', { 
        title, 
        description, 
        startTime: startDate.toISOString(), 
        endTime: endDate.toISOString(), 
        problems: selectedProblems 
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      navigate('/contests');
    } catch (error) {
      console.error('Error creating contest:', error);
      setError(error.response?.data?.message || 'Failed to create contest');
    }
  };
  
  const handleProblemSelection = (problemId) => {
    setSelectedProblems(prev => {
      if (prev.includes(problemId)) {
        return prev.filter(id => id !== problemId);
      } else {
        return [...prev, problemId];
      }
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-primary-pink mb-8 text-center">Create New Contest</h1>
        
        <div className="bg-dark-surface rounded-lg shadow-lg p-6 mb-8">
          {error && (
            <div className="bg-red-900 text-white p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-primary-pink text-sm font-medium mb-2">Contest Title</label>
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
          <label className="block text-primary-pink text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink text-white min-h-[120px]"
            placeholder="Provide contest details, rules, and guidelines"
            required
          ></textarea>
        </div>
        <div className="mb-6">
          <label className="block text-primary-pink text-sm font-medium mb-2">Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-3 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink text-white"
            required
          />
          <p className="text-text-secondary text-xs mt-1">Select the exact time when the contest should start</p>
        </div>
        <div className="mb-6">
          <label className="block text-primary-pink text-sm font-medium mb-2">End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-3 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink text-white"
            required
          />
          <p className="text-text-secondary text-xs mt-1">Select the time when the contest should end</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-primary-pink text-sm font-medium mb-2">Select Problems</label>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-pink"></div>
            </div>
          ) : problems.length === 0 ? (
            <div className="bg-dark-bg border border-gray-700 rounded-md p-4 text-center">
              <p className="text-text-secondary">No problems available. Please create some problems first.</p>
              <button 
                type="button" 
                onClick={() => navigate('/create-problem')} 
                className="mt-3 bg-primary-pink hover:bg-secondary-pink text-white px-4 py-2 rounded-md transition-colors"
              >
                Create Problem
              </button>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto bg-dark-bg border border-gray-700 rounded-md p-3">
              {problems.map(problem => (
                <div key={problem._id} className="flex items-center p-2 border-b border-gray-700 last:border-b-0 hover:bg-gray-800 transition-colors rounded-md">
                  <input
                    type="checkbox"
                    id={`problem-${problem._id}`}
                    checked={selectedProblems.includes(problem._id)}
                    onChange={() => handleProblemSelection(problem._id)}
                    className="mr-3 h-4 w-4 accent-primary-pink"
                  />
                  <label htmlFor={`problem-${problem._id}`} className="cursor-pointer flex-grow">
                    {problem.title} 
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${problem.difficulty === 'Easy' ? 'bg-green-600 text-white' : problem.difficulty === 'Medium' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'}`}>
                      {problem.difficulty}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
          {selectedProblems.length === 0 && !loading && problems.length > 0 && (
            <p className="text-red-500 text-sm mt-1">Please select at least one problem</p>
          )}
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
            Create Contest
          </button>
        </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateContest;
