import React from 'react';
import { useNavigate } from "react-router-dom";
import { problems } from '../data/problems';

function Problems() {
  const navigate = useNavigate();
  
  const handleProblemClick = (problem) => {
    navigate(`/problem/${problem.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Coding Problems</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map(problem => (
            <div
              key={problem.id}
              onClick={() => handleProblemClick(problem)}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{problem.title}</h2>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {problem.difficulty}
              </div>
              <p className="mt-4 text-gray-600 text-sm">{problem.description.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Problems;