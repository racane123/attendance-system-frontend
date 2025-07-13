import React from 'react';
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

const NgrokWarning = ({ backendUrl, onRetry }) => {
  const handleVisitBackend = () => {
    if (backendUrl) {
      window.open(backendUrl, '_blank');
    }
  };

  return (
    <div className="card p-6 bg-warning-50 border border-warning-200">
      <div className="flex items-start">
        <AlertTriangle className="h-6 w-6 text-warning-600 mr-3 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-warning-800 mb-2">
            Ngrok Warning Page Detected
          </h3>
          <p className="text-warning-700 mb-4">
            Your backend API is being served through ngrok, which requires you to accept a warning page before accessing the API.
          </p>
          
          <div className="space-y-3">
            <div className="bg-white p-3 rounded border">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Backend URL:</strong> {backendUrl || 'Not configured'}
              </p>
              <button
                onClick={handleVisitBackend}
                disabled={!backendUrl}
                className="btn-secondary text-sm inline-flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Backend URL
              </button>
            </div>
            
            <div className="text-sm text-warning-700">
              <p className="font-medium mb-1">Steps to resolve:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click "Visit Backend URL" above (opens in new tab)</li>
                <li>On the ngrok warning page, click "Visit Site" or "Proceed"</li>
                <li>Return to this app and click "Retry" below</li>
              </ol>
            </div>
            
            <button
              onClick={onRetry}
              className="btn-primary inline-flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry API Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NgrokWarning; 