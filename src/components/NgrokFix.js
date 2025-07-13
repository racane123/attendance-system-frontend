import React, { useState } from 'react';
import { updateApiBaseUrl } from '../services/api';

const NgrokFix = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState(null);

  const fixNgrokIssue = async () => {
    setIsFixing(true);
    setResult(null);

    try {
      // Clear any cached URLs
      localStorage.removeItem('backendApiUrl');
      
      // Update API base URL to use environment variable
      updateApiBaseUrl();
      
      setResult({
        success: true,
        message: 'Ngrok configuration reset. Please refresh the page and try again.'
      });
      
      // Auto-refresh after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setIsFixing(false);
    }
  };

  const openBackendUrl = () => {
    const backendUrl = process.env.REACT_APP_API_URL || 'https://ff14-136-158-39-55.ngrok-free.app/api';
    window.open(backendUrl, '_blank');
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-yellow-100 border border-yellow-400 rounded-lg p-4 max-w-md">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Ngrok Warning Fix</h3>
      <p className="text-sm text-yellow-700 mb-4">
        You're seeing a ngrok warning page error. Follow these steps to fix it:
      </p>
      
      <div className="space-y-3">
        <button
          onClick={openBackendUrl}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Step 1: Open Backend URL
        </button>
        
        <p className="text-xs text-yellow-600">
          Click the button above to open your backend URL in a new tab. Accept the ngrok warning page.
        </p>
        
        <button
          onClick={fixNgrokIssue}
          disabled={isFixing}
          className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {isFixing ? 'Fixing...' : 'Step 2: Fix Configuration'}
        </button>
      </div>
      
      {result && (
        <div className={`mt-3 p-2 rounded text-sm ${
          result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {result.message}
        </div>
      )}
    </div>
  );
};

export default NgrokFix; 