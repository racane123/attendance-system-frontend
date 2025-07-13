import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, subjectsAPI } from '../services/api';

const TokenDebug = () => {
  const { user, token, isAuthenticated, updateToken, clearAuth, loadAttempts } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testToken = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('=== Token Debug Test ===');
      console.log('Current token:', token);
      console.log('localStorage token:', localStorage.getItem('token'));
      console.log('User:', user);
      console.log('Is authenticated:', isAuthenticated);
      console.log('Load attempts:', loadAttempts);
      
      // Test profile endpoint
      const profileResponse = await authAPI.getProfile();
      console.log('Profile test successful:', profileResponse.data);
      
      // Test subjects endpoint
      const subjectsResponse = await subjectsAPI.getAll();
      console.log('Subjects test successful:', subjectsResponse.data);
      
      setTestResult({
        success: true,
        message: 'All tests passed!',
        profile: profileResponse.data,
        subjects: subjectsResponse.data
      });
      
    } catch (error) {
      console.error('Token test failed:', error);
      setTestResult({
        success: false,
        message: error.message,
        error: error.response?.data || error
      });
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    clearAuth();
    setTestResult(null);
  };

  const refreshToken = () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      updateToken(storedToken);
      setTestResult({ success: true, message: 'Token refreshed from localStorage' });
    } else {
      setTestResult({ success: false, message: 'No token found in localStorage' });
    }
  };

  const forceLoadUser = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getProfile();
      setTestResult({
        success: true,
        message: 'User profile loaded successfully',
        profile: response.data
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to load user profile',
        error: error.response?.data || error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 bg-gray-50 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Token Debug Panel</h3>
      
      <div className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Token in State:</strong> {token ? 'Present' : 'Missing'}
          </div>
          <div>
            <strong>Token in localStorage:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}
          </div>
          <div>
            <strong>User:</strong> {user ? user.username : 'None'}
          </div>
          <div>
            <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Load Attempts:</strong> {loadAttempts}
          </div>
          <div>
            <strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'Not set'}
          </div>
        </div>

        {/* Token Preview */}
        {token && (
          <div className="text-xs bg-gray-100 p-2 rounded">
            <strong>Token Preview:</strong> {token.substring(0, 50)}...
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testToken}
            disabled={loading}
            className="btn-primary text-sm"
          >
            {loading ? 'Testing...' : 'Test Token'}
          </button>
          <button
            onClick={refreshToken}
            className="btn-secondary text-sm"
          >
            Refresh Token
          </button>
          <button
            onClick={forceLoadUser}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            Force Load User
          </button>
          <button
            onClick={clearToken}
            className="btn-danger text-sm"
          >
            Clear Token
          </button>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className={`p-3 rounded text-sm ${
            testResult.success ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
          }`}>
            <strong>{testResult.success ? '✅ Success:' : '❌ Error:'}</strong> {testResult.message}
            {testResult.error && (
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(testResult.error, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenDebug; 