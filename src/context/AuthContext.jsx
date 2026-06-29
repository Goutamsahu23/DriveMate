import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const skipVerificationRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent running multiple times
    if (initializedRef.current) return;
    initializedRef.current = true;

    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setLoading(false);
        
        // Only verify if we didn't just log in
        if (!skipVerificationRef.current) {
          // Verify token in background - but don't clear user on failure
          api.get('/users/me')
            .then(res => {
              setUser(res.data);
              localStorage.setItem('user', JSON.stringify(res.data));
            })
            .catch((error) => {
              // Don't clear user on verification failure
              // Only log the error for debugging
              console.warn('Token verification failed:', error.response?.status || error.message);
              // Keep user logged in - they can still use the app
            });
        } else {
          // Clear the flag after a delay
          setTimeout(() => {
            skipVerificationRef.current = false;
          }, 2000);
        }
      } catch (e) {
        console.error('Failed to parse user:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Set flag to skip verification
      skipVerificationRef.current = true;
      
      const res = await api.post('/auth/login', { email, password });
      
      if (!res.data || !res.data.token || !res.data.user) {
        skipVerificationRef.current = false;
        return {
          success: false,
          message: res.data?.message || 'Server did not return authentication data'
        };
      }
      
      const token = res.data.token;
      const user = res.data.user;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set user state
      setUser(user);
      setLoading(false);
      
      return { success: true, user };
    } catch (error) {
      skipVerificationRef.current = false;
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid email or password';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid credentials';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      skipVerificationRef.current = true;
      
      const res = await api.post('/auth/register', userData);
      
      if (!res.data.token) {
        skipVerificationRef.current = false;
        return {
          success: false,
          message: 'Server did not return authentication token'
        };
      }
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setLoading(false);
      
      return { success: true, user: res.data.user };
    } catch (error) {
      skipVerificationRef.current = false;
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.status === 400) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
          errorMessage = error.response.data.errors.map(e => e.msg).join(', ');
        }
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
      
      return {
        success: false,
        message: errorMessage,
        errors: error.response?.data?.errors
      };
    }
  };

  const logout = () => {
    skipVerificationRef.current = false;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateLocation = async (lat, lng) => {
    try {
      await api.patch('/users/location', { lat, lng });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const updateAvailability = async (isAvailable) => {
    try {
      await api.patch('/users/availability', { isAvailable });
      if (user) {
        setUser({ ...user, isAvailable });
      }
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateLocation,
      updateAvailability
    }}>
      {children}
    </AuthContext.Provider>
  );
};
