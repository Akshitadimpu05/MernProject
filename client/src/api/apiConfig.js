// API configuration for both development and production environments
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const COMPILER_BASE_URL = import.meta.env.VITE_COMPILER_URL || '/api/compiler';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to get error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    } catch (e) {
      throw new Error(`API error: ${response.status}`);
    }
  }
  return response.json();
};

// Create API request with proper headers
const createRequest = (method, endpoint, data = null, customHeaders = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
    credentials: 'include'
  };
  
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }
  
  const url = endpoint.startsWith('/compiler') 
    ? `${COMPILER_BASE_URL}${endpoint.replace('/compiler', '')}`
    : `${API_BASE_URL}${endpoint}`;
    
  return fetch(url, config).then(handleResponse);
};

// API methods
export const api = {
  get: (endpoint, customHeaders = {}) => createRequest('GET', endpoint, null, customHeaders),
  post: (endpoint, data, customHeaders = {}) => createRequest('POST', endpoint, data, customHeaders),
  put: (endpoint, data, customHeaders = {}) => createRequest('PUT', endpoint, data, customHeaders),
  delete: (endpoint, customHeaders = {}) => createRequest('DELETE', endpoint, null, customHeaders),
  
  // Special method for compiler service
  compiler: {
    run: (language, code, input) => {
      return createRequest('POST', '/compiler/run', { language, code, input });
    }
  }
};

export default api;
