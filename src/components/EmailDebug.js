import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { emailAPI, healthAPI } from '../services/api';

const EmailDebug = () => {
  const { token, user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gatherDebugInfo();
  }, []);

  const gatherDebugInfo = async () => {
    const info = {
      token: token ? 'Present' : 'Missing',
      user: user ? `${user.username} (${user.role})` : 'Not logged in',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      location: window.location.href
    };

    // Test API connectivity
    try {
      const response = await healthAPI.check();
      info.apiHealth = response.status === 200 ? 'Connected' : `Error: ${response.status}`;
      info.apiBaseUrl = response.config?.baseURL || 'Unknown';
    } catch (error) {
      info.apiHealth = `Error: ${error.message}`;
      info.apiBaseUrl = 'Failed to get';
    }

    // Test email endpoints
    const emailEndpoints = [
      { name: 'Email History', test: () => emailAPI.getHistory({ page: 1, limit: 1 }) },
      { name: 'Email Stats', test: () => emailAPI.getStats({ days: 7 }) },
      { name: 'Email Preferences', test: () => emailAPI.getPreferences() }
    ];

    info.emailEndpoints = {};
    for (const endpoint of emailEndpoints) {
      try {
        const response = await endpoint.test();
        info.emailEndpoints[endpoint.name] = `✅ ${response.status}`;
      } catch (error) {
        info.emailEndpoints[endpoint.name] = `❌ ${error.response?.status || error.message}`;
      }
    }

    setDebugInfo(info);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-4">Loading debug info...</div>;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Email Integration Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>API Base URL:</strong> {debugInfo.apiBaseUrl}</div>
        <div><strong>Token:</strong> {debugInfo.token}</div>
        <div><strong>User:</strong> {debugInfo.user}</div>
        <div><strong>API Health:</strong> {debugInfo.apiHealth}</div>
        <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
        
        <div className="mt-4">
          <strong>Email Endpoints:</strong>
          <ul className="ml-4 mt-1">
            {Object.entries(debugInfo.emailEndpoints || {}).map(([endpoint, status]) => (
              <li key={endpoint}>
                {endpoint}: {status}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={gatherDebugInfo}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Debug Info
      </button>
    </div>
  );
};

export default EmailDebug; 