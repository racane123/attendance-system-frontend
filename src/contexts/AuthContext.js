import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Function to update token in both state and localStorage
  const updateToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem('token');
      setToken(null);
    }
  };

  // Function to clear auth data
  const clearAuth = () => {
    setUser(null);
    updateToken(null);
  };

  useEffect(() => {
    if (token && !justLoggedIn) {
      loadUser();
    } else if (justLoggedIn) {
      // If we just logged in, don't call loadUser again
      setJustLoggedIn(false);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token, justLoggedIn]);

  const loadUser = async () => {
    try {
      console.log('Loading user profile... (attempt', loadAttempts + 1, ')');
      const response = await authAPI.getProfile();
      console.log('Profile response:', response);
      
      // The /auth/profile endpoint returns { success: true, data: userObject }
      const userData = response.data.data;
      console.log('User data extracted:', userData);
      
      // Only set user if we got valid data
      if (userData && userData.id) {
        setUser(userData);
        setLoadAttempts(0); // Reset attempts on success
        console.log('User loaded successfully:', userData.username);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      
      // Only clear token if it's a 401/403 error (unauthorized)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Authentication error, clearing token');
        clearAuth();
        toast.error('Session expired. Please log in again.');
      } else {
        // For other errors (network, server issues), retry a few times before giving up
        const maxAttempts = 3;
        const currentAttempts = loadAttempts + 1;
        
        if (currentAttempts < maxAttempts) {
          console.warn(`Non-auth error loading user (attempt ${currentAttempts}/${maxAttempts}), will retry:`, error.message);
          setLoadAttempts(currentAttempts);
          
          // Retry after a delay
          setTimeout(() => {
            loadUser();
          }, 2000 * currentAttempts); // Exponential backoff: 2s, 4s, 6s
          
          return; // Don't set loading to false yet
        } else {
          console.error(`Failed to load user after ${maxAttempts} attempts, keeping token but not loading user`);
          // Don't clear the token, just set loading to false
          // The user can still use the app if they have a valid token
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('Login attempt for:', username);
      const response = await authAPI.login(username, password);
      console.log('Login response:', response);
      
      const { user: userData, token: authToken } = response.data.data;
      console.log('Extracted user data:', userData);
      console.log('Extracted token:', authToken ? 'Present' : 'Missing');
      
      if (!authToken) {
        throw new Error('No token received from server');
      }
      
      setUser(userData);
      updateToken(authToken);
      setJustLoggedIn(true);
      setLoadAttempts(0); // Reset attempts on successful login
      
      console.log('User and token set in state');
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, token: authToken } = response.data.data;
      
      if (!authToken) {
        throw new Error('No token received from server');
      }
      
      setUser(newUser);
      updateToken(authToken);
      setLoadAttempts(0); // Reset attempts on successful registration
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    clearAuth();
    setLoadAttempts(0);
    toast.info('Logged out successfully');
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    changePassword,
    hasRole,
    isAuthenticated: !!user,
    updateToken, // Expose this for debugging
    clearAuth,   // Expose this for debugging
    loadAttempts // Expose this for debugging
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 