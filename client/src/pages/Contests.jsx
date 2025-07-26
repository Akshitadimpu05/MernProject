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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Contests</h1>
        {user?.role === 'admin' && (
          <Link to="/admin/contest/create" className="bg-[#ff16ac] hover:bg-[#F06292] text-white px-4 py-2 rounded-md transition-colors">
            Create Contest
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests.map(contest => {
          // Check if user is enrolled by comparing IDs properly
          const isEnrolled = user && contest.enrolledUsers && contest.enrolledUsers.some(enrolledUser => 
            (typeof enrolledUser === 'string' ? enrolledUser === user._id : enrolledUser._id === user._id)
          );
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
            <div key={contest._id} className="bg-[#1E1E1E] border border-[#ff16ac] border-opacity-20 text-white p-6 rounded-lg shadow-lg hover:border-opacity-50 transition-all">
              <h2 className="text-2xl font-bold mb-3 text-[#ff16ac]">{contest.title}</h2>
              <p className="mb-4 text-[#B0B0B0]">{contest.description}</p>
              <div className="space-y-2">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ff6fd0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[#FFFFFF]"><strong>Starts:</strong> {new Date(contest.startTime).toLocaleString()}</span>
                </p>
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ff6fd0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[#FFFFFF]"><strong>Ends:</strong> {new Date(contest.endTime).toLocaleString()}</span>
                </p>
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ff6fd0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-[#FFFFFF]"><strong>Problems:</strong> {contest.problems?.length || 0}</span>
                </p>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <Link to={`/contests/${contest._id}`} className="text-[#ff16ac] hover:text-[#F06292] flex items-center transition-colors">
                  View Details
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <button 
                  onClick={() => handleEnroll(contest._id)}
                  disabled={buttonDisabled}
                  className={`px-4 py-2 rounded-md ${buttonDisabled && !isEnrolled ? 'bg-[#B0B0B0]' : isEnrolled ? 'bg-[#ff16ac]' : 'bg-[#4CAF50]'} text-white transition-colors`}>
                  {buttonText}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {contests.length === 0 && (
        <div className="bg-[#1E1E1E] border border-[#ff16ac] border-opacity-20 text-white p-6 rounded-lg text-center">
          <p className="text-[#B0B0B0]">No contests available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Contests;
