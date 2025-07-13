import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { healthAPI } from '../services/api';
import { Bug, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const DebugInfo = () => {
  const { user, token, isAuthenticated, loading } = useAuth();
  const [apiStatus, setApiStatus] = useState('checking');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      setApiStatus('checking');
      const response = await healthAPI.check();
      setApiStatus('success');
      setApiError('');
    } catch (error) {
      setApiStatus('error');
      setApiError(error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center mb-3">
        <Bug className="h-4 w-4 mr-2" />
        <span className="font-medium text-sm">Debug Info</span>
      </div>
      
      {console.log('DebugInfo user:', user)}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>Auth Status:</span>
          <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Loading:</span>
          <span className={loading ? 'text-yellow-600' : 'text-green-600'}>
            {loading ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Token:</span>
          <span className={token ? 'text-green-600' : 'text-red-600'}>
            {token ? 'Present' : 'Missing'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>User Role:</span>
          <span className="text-blue-600">
            {user?.role || 'None'}
          </span>
        </div>
        
        <div className="mt-2 p-1 bg-gray-100 rounded text-gray-700 break-all">
          <span className="font-bold">User object:</span>
          <pre className="whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
        </div>
        
        <div className="flex items-center justify-between">
          <span>API Status:</span>
          <div className="flex items-center">
            {apiStatus === 'checking' && <RefreshCw className="h-3 w-3 animate-spin text-yellow-600" />}
            {apiStatus === 'success' && <CheckCircle className="h-3 w-3 text-green-600" />}
            {apiStatus === 'error' && <XCircle className="h-3 w-3 text-red-600" />}
            <span className={`ml-1 ${apiStatus === 'success' ? 'text-green-600' : apiStatus === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
              {apiStatus}
            </span>
          </div>
        </div>
        
        {apiError && (
          <div className="text-red-600 text-xs">
            API Error: {apiError}
          </div>
        )}
      </div>
      
      <button
        onClick={checkApiStatus}
        className="mt-3 w-full text-xs btn-primary py-1"
      >
        Refresh API Status
      </button>
    </div>
  );
};

export default DebugInfo; 