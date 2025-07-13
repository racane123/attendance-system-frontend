import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, AlertTriangle } from 'lucide-react';
import { healthAPI } from '../services/api';

const ApiConfig = () => {
  const [backendUrl, setBackendUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load saved backend URL
    const savedUrl = localStorage.getItem('backendApiUrl');
    if (savedUrl) {
      setBackendUrl(savedUrl);
      testConnection(savedUrl);
    }
  }, []);

  const testConnection = async (url) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Temporarily set the API URL
      const originalUrl = localStorage.getItem('backendApiUrl');
      localStorage.setItem('backendApiUrl', url);
      
      // Test the connection
      const response = await healthAPI.check();
      
      if (response.data.message === 'Server is running') {
        setIsConnected(true);
        setError('');
      } else {
        setIsConnected(false);
        setError('Unexpected response from server');
      }
    } catch (err) {
      setIsConnected(false);
      setError(err.response?.data?.error || err.message || 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const saveBackendUrl = () => {
    if (!backendUrl.trim()) {
      setError('Please enter a backend URL');
      return;
    }

    // Ensure URL ends with /api
    let url = backendUrl.trim();
    if (!url.endsWith('/api')) {
      url = url.endsWith('/') ? url + 'api' : url + '/api';
    }

    localStorage.setItem('backendApiUrl', url);
    setBackendUrl(url);
    testConnection(url);
  };

  const resetToDefault = () => {
    localStorage.removeItem('backendApiUrl');
    setBackendUrl('');
    setIsConnected(false);
    setError('');
    window.location.reload();
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Settings className="h-5 w-5 mr-2" />
        API Configuration
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="label">Backend API URL</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="https://your-backend.ngrok.io/api"
              className="input flex-1"
            />
            <button
              onClick={saveBackendUrl}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Testing...' : 'Test & Save'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Enter your backend ngrok URL (should end with /api)
          </p>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
              <span className="font-medium text-success-800">Connected to Backend</span>
            </div>
            <p className="text-sm text-success-700 mt-1">
              API is working correctly
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-danger-600 mr-2" />
              <span className="font-medium text-danger-800">Connection Failed</span>
            </div>
            <p className="text-sm text-danger-700 mt-1">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">How to find your backend URL:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Look at your ngrok output for the backend tunnel URL</li>
            <li>It should look like: <code>https://abc123.ngrok.io</code></li>
            <li>Add <code>/api</code> to the end: <code>https://abc123.ngrok.io/api</code></li>
            <li>Enter it above and click "Test & Save"</li>
          </ol>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetToDefault}
          className="btn-secondary"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default ApiConfig; 