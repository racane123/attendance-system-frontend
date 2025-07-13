import React, { useState, useEffect, useCallback } from 'react';

const EmailDebug = () => {
  const [debugInfo, setDebugInfo] = useState('');

  const gatherDebugInfo = useCallback(() => {
    const info = {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      localStorage: Object.keys(localStorage),
      sessionStorage: Object.keys(sessionStorage),
      cookies: document.cookie,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight
      }
    };
    return JSON.stringify(info, null, 2);
  }, []);

  useEffect(() => {
    const info = gatherDebugInfo();
    setDebugInfo(info);
  }, [gatherDebugInfo]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(debugInfo);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Email Debug Information</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Debug Information
          </label>
          <textarea
            value={debugInfo}
            readOnly
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
          />
        </div>

        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
};

export default EmailDebug; 