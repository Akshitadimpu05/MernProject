import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../auth/auth';
import * as adminApi from '../api/adminApi';
import ProblemEditModal from '../components/admin/ProblemEditModal';
import ContestEditModal from '../components/admin/ContestEditModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [showContestModal, setShowContestModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, type: '', id: null });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    } else if (activeTab === 'problems') {
      fetchProblems();
    } else if (activeTab === 'contests') {
      fetchContests();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);
  
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardStats();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllProblems();
      setProblems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching problems:', error);
      setLoading(false);
    }
  };

  const fetchContests = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllContests();
      setContests(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contests:', error);
      setLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllUsers();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleDeleteProblem = async (id) => {
    try {
      await adminApi.deleteProblem(id);
      fetchProblems();
      setDeleteConfirmation({ show: false, type: '', id: null });
    } catch (error) {
      console.error('Error deleting problem:', error);
    }
  };

  const handleDeleteContest = async (id) => {
    try {
      await adminApi.deleteContest(id);
      fetchContests();
      setDeleteConfirmation({ show: false, type: '', id: null });
    } catch (error) {
      console.error('Error deleting contest:', error);
    }
  };
  
  const handleUpdateUserRole = async (userId, role) => {
    try {
      await adminApi.updateUserRole(userId, role);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const openProblemModal = (problem = null) => {
    setSelectedItem(problem);
    setShowProblemModal(true);
  };

  const openContestModal = (contest = null) => {
    setSelectedItem(contest);
    setShowContestModal(true);
  };

  const renderDashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-pink"></div>
          </div>
        ) : (
          <>
            <div className="bg-dark-surface rounded-lg shadow-lg p-6 border-l-4 border-primary-pink">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-primary-pink">Users</h3>
                <span className="text-3xl font-bold text-primary-pink">{stats.userCount || 0}</span>
              </div>
              <p className="text-text-secondary mb-4">Total registered users</p>
              <button
                onClick={() => setActiveTab('users')}
                className="w-full py-2 bg-primary-pink hover:bg-secondary-pink text-white rounded-md transition-colors"
              >
                Manage Users
              </button>
            </div>
            
            <div className="bg-dark-surface rounded-lg shadow-lg p-6 border-l-4 border-accent-pink">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-accent-pink">Problems</h3>
                <span className="text-3xl font-bold text-accent-pink">{stats.problemCount || 0}</span>
              </div>
              <p className="text-text-secondary mb-4">Total problems</p>
              <button 
                onClick={() => setActiveTab('problems')} 
                className="w-full py-2 bg-accent-pink hover:bg-secondary-pink text-white rounded-md transition-colors"
              >
                Manage Problems
              </button>
            </div>
            
            <div className="bg-dark-surface rounded-lg shadow-lg p-6 border-l-4 border-secondary-pink">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-secondary-pink">Contests</h3>
                <span className="text-3xl font-bold text-secondary-pink">{stats.contestCount || 0}</span>
              </div>
              <p className="text-text-secondary mb-4">Total contests</p>
              <button 
                onClick={() => setActiveTab('contests')} 
                className="w-full py-2 bg-secondary-pink hover:bg-primary-pink text-white rounded-md transition-colors"
              >
                Manage Contests
              </button>
            </div>
            
            {stats.problemsByDifficulty && (
              <div className="col-span-3 bg-dark-surface rounded-lg shadow-lg p-6 mt-6">
                <h3 className="text-xl font-semibold text-primary-pink mb-4">Problems by Difficulty</h3>
                <div className="flex justify-around">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">{stats.problemsByDifficulty.easy || 0}</div>
                    <div className="text-sm text-text-secondary">Easy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">{stats.problemsByDifficulty.medium || 0}</div>
                    <div className="text-sm text-text-secondary">Medium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500">{stats.problemsByDifficulty.hard || 0}</div>
                    <div className="text-sm text-text-secondary">Hard</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderProblems = () => (
    <div className="bg-dark-surface rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-pink">Problems Management</h2>
        <Link 
          to="/admin/problem/create" 
          className="px-4 py-2 bg-primary-pink hover:bg-secondary-pink text-white rounded-md transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Problem
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-pink"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-dark-bg rounded-lg overflow-hidden">
            <thead className="bg-dark-surface border-b border-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-primary-pink">ID</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-primary-pink">Title</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-primary-pink">Difficulty</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-primary-pink">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {problems.map(problem => (
                <tr key={problem._id} className="hover:bg-dark-surface transition-colors">
                  <td className="py-3 px-4 text-sm">{problem._id.substring(0, 8)}...</td>
                  <td className="py-3 px-4 text-sm">{problem.title}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 text-xs rounded ${
                      problem.difficulty === 'Easy' 
                        ? 'bg-green-600' 
                        : problem.difficulty === 'Medium' 
                          ? 'bg-yellow-600' 
                          : 'bg-red-600'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openProblemModal(problem)}
                        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmation({ show: true, type: 'problem', id: problem._id })}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderContests = () => (
    <div className="bg-dark-surface rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-accent-pink">Contests Management</h2>
        <Link 
          to="/admin/contest/create" 
          className="px-4 py-2 bg-accent-pink hover:bg-secondary-pink text-white rounded-md transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Contest
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-pink"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-dark-bg rounded-lg overflow-hidden">
            <thead className="bg-dark-surface border-b border-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-accent-pink">ID</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-accent-pink">Title</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-accent-pink">Start Date</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-accent-pink">End Date</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-accent-pink">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {contests.map(contest => (
                <tr key={contest._id} className="hover:bg-dark-surface transition-colors">
                  <td className="py-3 px-4 text-sm">{contest._id.substring(0, 8)}...</td>
                  <td className="py-3 px-4 text-sm">{contest.title}</td>
                  <td className="py-3 px-4 text-sm">{new Date(contest.startDate).toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm">{new Date(contest.endDate).toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openContestModal(contest)}
                        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmation({ show: true, type: 'contest', id: contest._id })}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="bg-dark-surface rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-pink">Users Management</h2>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-pink"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-dark-bg rounded-lg overflow-hidden">
            <thead className="bg-dark-surface border-b border-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-primary-pink">ID</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-primary-pink">Name</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-primary-pink">Email</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-primary-pink">Role</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-primary-pink">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-dark-surface transition-colors">
                  <td className="py-3 px-4 text-sm">{user._id.substring(0, 8)}...</td>
                  <td className="py-3 px-4 text-sm">{user.name}</td>
                  <td className="py-3 px-4 text-sm">{user.email}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-primary-pink text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex space-x-2">
                      {user.role === 'user' ? (
                        <button
                          onClick={() => handleUpdateUserRole(user._id, 'admin')}
                          className="px-2 py-1 bg-primary-pink hover:bg-secondary-pink text-white rounded-md text-xs transition-colors"
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateUserRole(user._id, 'user')}
                          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs transition-colors"
                        >
                          Remove Admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderDeleteConfirmation = () => {
    if (!deleteConfirmation.show) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-dark-surface p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-xl font-bold text-primary-pink mb-4">Confirm Delete</h3>
          <p className="mb-6 text-text-secondary">
            Are you sure you want to delete this {deleteConfirmation.type}? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setDeleteConfirmation({ show: false, type: '', id: null })}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => 
                deleteConfirmation.type === 'problem' 
                  ? handleDeleteProblem(deleteConfirmation.id) 
                  : handleDeleteContest(deleteConfirmation.id)
              }
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProblemModal = () => {
    if (!showProblemModal) return null;
    return (
      <ProblemEditModal 
        problem={selectedItem}
        onClose={() => setShowProblemModal(false)}
        onSave={(updatedProblem) => {
          setShowProblemModal(false);
          fetchProblems();
        }}
      />
    );
  };

  const renderContestModal = () => {
    if (!showContestModal) return null;
    
    return (
      <ContestEditModal 
        contest={selectedItem}
        onClose={() => setShowContestModal(false)}
        onSave={(updatedContest) => {
          setShowContestModal(false);
          fetchContests();
        }}
      />
    );
  };
  
  return (
    <div className="min-h-screen bg-dark-bg text-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary-pink mb-8">Admin Dashboard</h1>
        
        <div className="bg-dark-surface rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-700 px-6 py-4">
            <div className="flex space-x-4">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-primary-pink text-white' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'users' 
                    ? 'bg-primary-pink text-white' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                Users
              </button>
              <button 
                onClick={() => setActiveTab('problems')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'problems' 
                    ? 'bg-primary-pink text-white' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                Problems
              </button>
              <button 
                onClick={() => setActiveTab('contests')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'contests' 
                    ? 'bg-primary-pink text-white' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                Contests
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'problems' && renderProblems()}
            {activeTab === 'contests' && renderContests()}
            {activeTab === 'users' && renderUsers()}
          </div>
        </div>
      </div>
      
      {renderProblemModal()}
      {renderContestModal()}
      {deleteConfirmation.show && renderDeleteConfirmation()}
    </div>
  );
};

export default AdminDashboard;