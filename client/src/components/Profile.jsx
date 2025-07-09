// src/components/Profile.jsx
import React from 'react';
import { useSelector } from 'react-redux';

function Profile() {
  const { user } = useSelector(state => state.user);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-[#3B1C32] mb-6">User Profile</h1>
      
      <div className="mb-4">
        <p className="text-lg">
          <span className="font-semibold">Username:</span> {user?.username || 'N/A'}
        </p>
      </div>
      
      <div className="mb-4">
        <p className="text-lg">
          <span className="font-semibold">Email:</span> {user?.email || 'N/A'}
        </p>
      </div>
      
      {/* Add more profile information here */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Statistics</h2>
        <p>Problems solved: Coming soon</p>
        <p>Total submissions: Coming soon</p>
        <p>Streak: Coming soon</p>
      </div>
    </div>
  );
}

export default Profile;