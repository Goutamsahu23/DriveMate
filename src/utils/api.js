import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const currentPath = window.location.pathname;
    const requestUrl = error.config?.url || '';
    
    // Don't redirect if already on login/register pages
    if (currentPath.includes('/login') || currentPath.includes('/register')) {
      return Promise.reject(error);
    }
    
    // Never redirect for /users/me endpoint failures (handled by AuthContext)
    if (requestUrl.includes('/users/me')) {
      return Promise.reject(error);
    }
    
    // Only handle 401 errors (unauthorized), ignore network errors
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already going to login
      if (!currentPath.includes('/login')) {
        // Use window.location for a clean redirect (clears React state)
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
