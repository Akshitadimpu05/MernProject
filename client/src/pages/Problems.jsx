import React from 'react';
import { useNavigate } from "react-router-dom";
import { problems } from '../data/problems';
import { useSelector } from 'react-redux';

function Problems() {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  
  const handleProblemClick = (problem) => {
    if (problem.isPremium && (!user || !user.isPremium)) {
      navigate('/premium');
    } else {
      navigate(`/problems/${problem.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg px-4 py-8">
      <div className="container max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-pink mb-6">Coding Problems</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map(problem => (
            <div
              key={problem.id}
              onClick={() => handleProblemClick(problem)}
              className="bg-dark-surface rounded-lg border border-gray-800 shadow-lg p-6 cursor-pointer hover:border-primary-pink transition-all duration-300 relative"
            >
              {problem.isPremium && (!user || !user.isPremium) && (
                <div className="absolute top-0 right-0 bg-[#FF4081] text-white px-2 py-1 rounded-bl-lg rounded-tr-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs font-medium">Premium</span>
                </div>
              )}
              <h2 className="text-xl font-bold text-white mb-3">{problem.title}</h2>
              <div className="flex justify-between items-center">
                <div className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${
                  problem.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                  problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {problem.difficulty}
                </div>
                <div className="text-xs text-text-secondary">Problem #{problem.id}</div>
              </div>
              <p className="mt-4 text-text-secondary text-sm line-clamp-3">{problem.description.substring(0, 120)}...</p>
              <div className="mt-4 flex justify-end">
                {problem.isPremium && (!user || !user.isPremium) ? (
                  <button className="text-[#FF80AB] hover:text-[#FF4081] text-sm transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Unlock with Premium
                  </button>
                ) : (
                  <button className="text-accent-pink hover:text-primary-pink text-sm transition-colors">
                    Solve Challenge →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Problems;