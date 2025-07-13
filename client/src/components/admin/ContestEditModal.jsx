import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../auth/auth';

const ContestEditModal = ({ contest, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    problems: []
  });
  const [availableProblems, setAvailableProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProblems();
    
    if (contest) {
      // Format dates for datetime-local input
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };
      
      setFormData({
        title: contest.title || '',
        description: contest.description || '',
        startDate: formatDate(contest.startDate),
        endDate: formatDate(contest.endDate),
        problems: contest.problems || []
      });
    }
  }, [contest]);

  const fetchProblems = async () => {
    try {
      const response = await axios.get('/api/problems', {
        headers: { Authorization: `Bearer ${auth.getToken()}` }
      });
      setAvailableProblems(response.data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProblemToggle = (problemId) => {
    setFormData(prev => {
      const isAlreadyAdded = prev.problems.includes(problemId);
      
      if (isAlreadyAdded) {
        return {
          ...prev,
          problems: prev.problems.filter(id => id !== problemId)
        };
      } else {
        return {
          ...prev,
          problems: [...prev.problems, problemId]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (contest && contest._id) {
        // Update existing contest
        response = await axios.put(`/api/contests/${contest._id}`, formData, {
          headers: { Authorization: `Bearer ${auth.getToken()}` }
        });
      } else {
        // Create new contest
        response = await axios.post('/api/contests', formData, {
          headers: { Authorization: `Bearer ${auth.getToken()}` }
        });
      }
      
      setLoading(false);
      onSave(response.data);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred while saving the contest');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-accent-pink">
              {contest && contest._id ? 'Edit Contest' : 'Create New Contest'}
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
                className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-pink"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-pink"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-pink"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-dark-bg border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-pink"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Select Problems</label>
              <div className="bg-dark-bg border border-gray-700 rounded-md p-4 max-h-60 overflow-y-auto">
                {availableProblems.length === 0 ? (
                  <p className="text-gray-400 text-sm">No problems available. Please create some problems first.</p>
                ) : (
                  <div className="space-y-2">
                    {availableProblems.map(problem => (
                      <div key={problem._id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`problem-${problem._id}`}
                          checked={formData.problems.includes(problem._id)}
                          onChange={() => handleProblemToggle(problem._id)}
                          className="h-4 w-4 text-accent-pink focus:ring-accent-pink border-gray-700 rounded"
                        />
                        <label htmlFor={`problem-${problem._id}`} className="ml-2 block text-sm text-gray-300">
                          <span className={`inline-block w-16 text-xs px-2 py-1 rounded mr-2 ${
                            problem.difficulty === 'Easy' ? 'bg-green-600' : 
                            problem.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {problem.difficulty}
                          </span>
                          {problem.title}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Selected problems: {formData.problems.length}
              </p>
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
                className="px-4 py-2 bg-accent-pink hover:bg-secondary-pink text-white rounded-md transition-colors flex items-center"
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
                  'Save Contest'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContestEditModal;
