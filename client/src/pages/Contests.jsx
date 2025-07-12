import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const { user } = useSelector(state => state.user);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data } = await axios.get('/api/contests');
        setContests(data);
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
    };

    fetchContests();
  }, []);

  const handleEnroll = async (contestId) => {
    try {
      await axios.post(`/api/contests/${contestId}/enroll`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Refresh contests to show updated enrollment status
      const { data } = await axios.get('/api/contests');
      setContests(data);
      alert('Enrolled successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to enroll.');
    }
  };

  const isContestActive = (startTime, endTime) => {
    const now = new Date();
    return new Date(startTime) <= now && now <= new Date(endTime);
  };
  
  const isContestStarted = (startTime) => {
    const now = new Date();
    return new Date(startTime) <= now;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white">Contests</h1>
        {user?.role === 'admin' && (
          <Link to="/admin/contest/create" className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Contest
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contests.map(contest => {
          // Check if user is enrolled by comparing IDs properly
          const isEnrolled = user && contest.enrolledUsers.some(userId => userId === user._id);
          const active = isContestActive(contest.startTime, contest.endTime);
          const started = isContestStarted(contest.startTime);
          
          // Determine button state and text
          let buttonText = 'Enroll';
          let buttonDisabled = false;
          
          if (isEnrolled) {
            buttonText = 'Enrolled';
            buttonDisabled = true;
          } else if (!started) {
            buttonText = 'Not Started';
            buttonDisabled = true;
          } else if (!user) {
            buttonText = 'Login to Enroll';
            buttonDisabled = true;
          }
          
          return (
            <div key={contest._id} className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-2">{contest.title}</h2>
              <p className="mb-4">{contest.description}</p>
              <p><strong>Starts:</strong> {new Date(contest.startTime).toLocaleString()}</p>
              <p><strong>Ends:</strong> {new Date(contest.endTime).toLocaleString()}</p>
              <p><strong>Problems:</strong> {contest.problems?.length || 0}</p>
              <div className="mt-4 flex justify-between">
                <Link to={`/contests/${contest._id}`} className="text-blue-400 hover:underline">
                  View Details
                </Link>
                <button 
                  onClick={() => handleEnroll(contest._id)}
                  disabled={buttonDisabled}
                  className={`px-3 py-1 rounded ${buttonDisabled && !isEnrolled ? 'bg-gray-500' : isEnrolled ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
                  {buttonText}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Contests;
