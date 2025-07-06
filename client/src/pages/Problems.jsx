import React from 'react';
import { useNavigate } from "react-router-dom";
import { auth } from "../auth/auth.js";
import { problems } from '../data/problems';

function Problems() {
  const navigate = useNavigate();

  const handleProblemClick = (problem) => {
    navigate(`/problem/${problem.id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    auth.logout(() => navigate("/login"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">All Problems</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map(problem => (
            <div
              key={problem.id}
              onClick={() => handleProblemClick(problem)}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{problem.title}</h2>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {problem.difficulty}
              </div>
              <p className="mt-4 text-gray-600 text-sm truncate max-w-md">{problem.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Problems;