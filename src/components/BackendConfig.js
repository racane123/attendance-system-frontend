import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Settings, Check, X } from 'lucide-react';
import { healthAPI, authAPI, updateApiBaseUrl } from '../services/api';

const BackendConfig = ({ onConfigChange }) => {
  const [backendUrl, setBackendUrl] = useState(localStorage.getItem('backendApiUrl') || '');
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    // Check if we have a saved backend URL and test it
    if (backendUrl) {
      testConnection();
    }
  }, []);

  const testConnection = async () => {
    if (!backendUrl) {
      setTestResult({ success: false, message: 'Please enter a backend URL' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Temporarily set the backend URL
      localStorage.setItem('backendApiUrl', backendUrl);
      
      // Update the API base URL
      updateApiBaseUrl();
      
      // Test the connection
      const response = await authAPI.getProfile();
      setTestResult({ 
        success: true, 
        message: 'Connection successful! Backend URL configured.' 
      });
      
      // Reload the page to apply the new configuration
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `Connection failed: ${error.message}` 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveBackendUrl = () => {
    if (!backendUrl.trim()) {
      toast.error('Please enter a backend URL');
      return;
    }

    // Ensure the URL ends with /api
    let url = backendUrl.trim();
    if (!url.endsWith('/api')) {
      url = url.endsWith('/') ? url + 'api' : url + '/api';
    }

    localStorage.setItem('backendApiUrl', url);
    setBackendUrl(url);
    
    if (onConfigChange) {
      onConfigChange(url);
    }
    
    toast.success('Backend URL saved! Testing connection...');
    testConnection();
  };

  const clearBackendUrl = () => {
    localStorage.removeItem('backendApiUrl');
    setBackendUrl('');
    setIsConnected(false);
    if (onConfigChange) {
      onConfigChange('');
    }
    toast.info('Backend URL cleared');
  };

  const resetToDefault = () => {
    localStorage.removeItem('backendApiUrl');
    setBackendUrl('');
    setTestResult({ 
      success: true, 
      message: 'Reset to default configuration. Please refresh the page.' 
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Config Button */}
      <button
        onClick={() => setShowConfig(!showConfig)}
        className={`p-3 rounded-full shadow-lg transition-all ${
          isConnected 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
        }`}
        title="Backend Configuration"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* Config Panel */}
      {showConfig && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Backend Configuration</h3>
            <button
              onClick={() => setShowConfig(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backend API URL
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="https://your-ngrok-url.ngrok-free.app/api"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your ngrok backend URL (should end with /api)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={testConnection}
                disabled={isTesting}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                onClick={resetToDefault}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset to Default
              </button>
            </div>

            {testResult && (
              <div className="flex items-center space-x-2 text-sm">
                <span>Status:</span>
                {testResult.success ? (
                  <span className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    {testResult.message}
                  </span>
                ) : (
                  <span className="text-red-600">{testResult.message}</span>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-medium mb-1">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Visit your ngrok backend URL directly</li>
                <li>Accept the ngrok warning page</li>
                <li>Enter the URL here (e.g., https://abc123.ngrok-free.app)</li>
                <li>Click "Test Connection"</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendConfig; 