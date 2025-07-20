import { auth } from '../auth/auth';

const API_URL = '/api';

// Helper function for API requests
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth.getToken()}`
  };

  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Something went wrong');
  }
  
  return response.json();
};

// Admin Dashboard Stats
export const getDashboardStats = () => {
  return apiRequest('/admin/stats');
};

// User Management
export const getAllUsers = () => {
  return apiRequest('/admin/users');
};

export const updateUserRole = (userId, role) => {
  return apiRequest(`/admin/users/${userId}/role`, 'PUT', { role });
};

// Problem Management
export const getAllProblems = () => {
  return apiRequest('/problems');
};

export const getProblemById = (id) => {
  return apiRequest(`/problems/${id}`);
};

export const createProblem = (problemData) => {
  return apiRequest('/problems', 'POST', problemData);
};

export const updateProblem = (id, problemData) => {
  return apiRequest(`/problems/${id}`, 'PUT', problemData);
};

export const deleteProblem = (id) => {
  return apiRequest(`/problems/${id}`, 'DELETE');
};

// Contest Management
export const getAllContests = () => {
  return apiRequest('/contests');
};

export const getContestById = (id) => {
  return apiRequest(`/contests/${id}`);
};

export const createContest = (contestData) => {
  return apiRequest('/contests', 'POST', contestData);
};

export const updateContest = (id, contestData) => {
  return apiRequest(`/contests/${id}`, 'PUT', contestData);
};

export const deleteContest = (id) => {
  return apiRequest(`/contests/${id}`, 'DELETE');
};
