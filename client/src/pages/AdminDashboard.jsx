import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/admin/contest/create" className="bg-blue-500 text-white p-4 rounded-lg text-center">
          <h2 className="text-xl font-semibold">Create Contest</h2>
        </Link>
        <Link to="/admin/problem/create" className="bg-green-500 text-white p-4 rounded-lg text-center">
          <h2 className="text-xl font-semibold">Create Problem</h2>
        </Link>
        {/* Add more admin links here in the future */}
      </div>
    </div>
  );
};

export default AdminDashboard;
