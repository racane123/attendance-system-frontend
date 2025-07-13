import React, { useState, useEffect, useCallback } from 'react';
import { healthAPI } from '../services/api';

const BackendConfig = () => {
  const [backendUrl, setBackendUrl] = useState(localStorage.getItem('backendUrl') || '');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = useCallback(async () => {
    if (!backendUrl.trim()) return;
    
    setIsLoading(true);
    try {
      await healthAPI(backendUrl);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    if (backendUrl) {
      testConnection();
    }
  }, [testConnection, backendUrl]);

  const saveBackendUrl = () => {
    if (backendUrl.trim()) {
      localStorage.setItem('backendUrl', backendUrl.trim());
      testConnection();
    }
  };

  const clearBackendUrl = () => {
    localStorage.removeItem('backendUrl');
    setBackendUrl('');
    setIsConnected(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Backend Configuration</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backend URL
          </label>
          <input
            type="url"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="https://your-backend-url.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={saveBackendUrl}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Save & Test'}
          </button>
          
          <button
            onClick={clearBackendUrl}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Clear
          </button>
        </div>

        {backendUrl && (
          <div className={`p-3 rounded-md ${
            isConnected 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="font-medium">
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendConfig; 