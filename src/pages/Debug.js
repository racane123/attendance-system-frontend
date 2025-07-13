import React, { useState, useEffect } from 'react';
import { Bug, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { healthAPI, authAPI } from '../services/api';

const Debug = () => {
  const [apiStatus, setApiStatus] = useState('checking');
  const [apiError, setApiError] = useState('');
  const [currentApiUrl, setCurrentApiUrl] = useState('');
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setApiStatus('checking');
    setApiError('');
    
    try {
      // Get current API URL
      const url = localStorage.getItem('backendApiUrl') || 'http://localhost:5000/api';
      setCurrentApiUrl(url);
      
      const response = await healthAPI.check();
      setApiStatus('success');
      setTestResults(prev => [...prev, { 
        test: 'Health Check', 
        status: 'success', 
        message: response.data.message 
      }]);
    } catch (error) {
      setApiStatus('error');
      setApiError(error.response?.data?.error || error.message);
      setTestResults(prev => [...prev, { 
        test: 'Health Check', 
        status: 'error', 
        message: error.response?.data?.error || error.message 
      }]);
    }
  };

  const runTests = async () => {
    setTestResults([]);
    
    // Test 1: Health Check
    await checkApiStatus();
    
    // Test 2: Try to get users (requires auth)
    try {
      await authAPI.getAllUsers();
      setTestResults(prev => [...prev, { 
        test: 'Get Users (Auth)', 
        status: 'success', 
        message: 'Authentication working' 
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, { 
        test: 'Get Users (Auth)', 
        status: 'error', 
        message: error.response?.data?.error || error.message 
      }]);
    }
    
    // Test 3: Try login
    try {
      await authAPI.login('admin', 'admin123');
      setTestResults(prev => [...prev, { 
        test: 'Login Test', 
        status: 'success', 
        message: 'Login working' 
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, { 
        test: 'Login Test', 
        status: 'error', 
        message: error.response?.data?.error || error.message 
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Bug className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">API Debug Page</h1>
          <p className="text-gray-600 mt-2">Troubleshoot API connection issues</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Status */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">API Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Current API URL</label>
                <div className="p-3 bg-gray-100 rounded-lg font-mono text-sm">
                  {currentApiUrl || 'Not set'}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {apiStatus === 'checking' && (
                  <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                )}
                {apiStatus === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {apiStatus === 'error' && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {apiStatus === 'checking' && 'Checking...'}
                  {apiStatus === 'success' && 'Connected'}
                  {apiStatus === 'error' && 'Connection Failed'}
                </span>
              </div>

              {apiError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{apiError}</p>
                </div>
              )}

              <button
                onClick={checkApiStatus}
                className="btn-primary w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check API Status
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
            
            <button
              onClick={runTests}
              className="btn-primary w-full mb-4"
            >
              <Bug className="h-4 w-4 mr-2" />
              Run All Tests
            </button>

            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.status === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.test}</span>
                    {result.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm mt-1">
                    {result.status === 'success' ? (
                      <span className="text-green-700">{result.message}</span>
                    ) : (
                      <span className="text-red-700">{result.message}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting Steps</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">1. Check Backend Server</h3>
              <p className="text-sm text-gray-600">
                Make sure your backend is running on port 5000. You should see "Server is running on port http://localhost:5000" in your backend terminal.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">2. Check ngrok Tunnels</h3>
              <p className="text-sm text-gray-600">
                Ensure both frontend and backend ngrok tunnels are running. Look for URLs like:
                <br />
                • Frontend: <code>https://abc123.ngrok.io</code>
                <br />
                • Backend: <code>https://def456.ngrok.io</code>
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">3. Configure API URL</h3>
              <p className="text-sm text-gray-600">
                Go to the login page and use the API Configuration section to set your backend URL.
                It should be: <code>https://your-backend.ngrok.io/api</code>
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">4. Check CORS</h3>
              <p className="text-sm text-gray-600">
                The backend should allow CORS from ngrok domains. Check the backend console for CORS errors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug; 