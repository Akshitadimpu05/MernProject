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
    try {
      await axios.post('/api/contests', { 
        title, 
        description, 
        startTime, 
        endTime, 
        problems: selectedProblems 
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      navigate('/contests');
    } catch (error) {
      console.error('Error creating contest:', error);
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Contest</h1>
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
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Problems</label>
          {loading ? (
            <p>Loading problems...</p>
          ) : problems.length === 0 ? (
            <p>No problems available. Please create some problems first.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto border rounded p-2">
              {problems.map(problem => (
                <div key={problem._id} className="flex items-center p-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    id={`problem-${problem._id}`}
                    checked={selectedProblems.includes(problem._id)}
                    onChange={() => handleProblemSelection(problem._id)}
                    className="mr-2"
                  />
                  <label htmlFor={`problem-${problem._id}`} className="cursor-pointer">
                    {problem.title} <span className="text-sm text-gray-500">({problem.difficulty})</span>
                  </label>
                </div>
              ))}
            </div>
          )}
          {selectedProblems.length === 0 && (
            <p className="text-red-500 text-sm mt-1">Please select at least one problem</p>
          )}
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Contest
        </button>
      </form>
    </div>
  );
};

export default CreateContest;
