import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff, Loader, Bug } from 'lucide-react';
import ApiConfig from '../components/ApiConfig';
import { authAPI } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDebugInfo('');

    try {
      console.log('Attempting login with:', formData);
      const result = await login(formData.username, formData.password);
      console.log('Login result:', result);
      
      if (result.success) {
        navigate('/');
      } else {
        setDebugInfo(`Login failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setDebugInfo(`Login error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDebugAuth = async () => {
    setDebugInfo('Testing authentication...');
    try {
      console.log('=== DEBUG AUTH START ===');
      
      // Test login
      console.log('Testing login...');
      const loginResponse = await authAPI.login('admin', 'admin123');
      console.log('Login response:', loginResponse);
      
      // Check if token is stored
      const storedToken = localStorage.getItem('token');
      console.log('Stored token:', storedToken ? 'Present' : 'Missing');
      
      // Test profile
      console.log('Testing profile...');
      const profileResponse = await authAPI.getProfile();
      console.log('Profile response:', profileResponse);
      
      setDebugInfo('Debug completed - check console for details');
      console.log('=== DEBUG AUTH END ===');
    } catch (error) {
      console.error('Auth debug error:', error);
      setDebugInfo(`Debug error: ${error.message}`);
    }
  };

  const handleTestToken = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    console.log('Current token:', token);
    console.log('Current user in localStorage:', user);
    setDebugInfo(`Token: ${token ? 'Present' : 'Missing'}, User: ${user ? 'Present' : 'Missing'}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <LogIn className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome to the Attendance Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your username or email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

        {/** 
          <div>
            <button
              type="button"
              onClick={handleDebugAuth}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Bug className="h-5 w-5 mr-2" />
              Debug Authentication
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                const token = localStorage.getItem('token');
                setDebugInfo(`Token in localStorage: ${token ? 'Present' : 'Missing'}`);
              }}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Test Token Storage
            </button>
          </div>

          {debugInfo && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">{debugInfo}</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Register here
              </Link>
            </p>
          </div>*/}
        </form>
      {/*
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Teacher:</strong> teacher / teacher123</p>
            <p><strong>Viewer:</strong> viewer / viewer123</p>
          </div>
        </div>

         API Configuration for ngrok 
        <ApiConfig />*/}
      </div>
    </div>
  );
};

export default Login; 