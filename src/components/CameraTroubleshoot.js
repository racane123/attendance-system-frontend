import React, { useState } from 'react';
import { Camera, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';

const CameraTroubleshoot = () => {
  const [showGuide, setShowGuide] = useState(false);

  const checkCameraSupport = () => {
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    const hasMediaDevices = !!navigator.mediaDevices;
    const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia;
    
    return {
      isSecure,
      hasMediaDevices,
      hasGetUserMedia,
      browser: navigator.userAgent,
      protocol: window.location.protocol,
      hostname: window.location.hostname
    };
  };

  const support = checkCameraSupport();

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Camera Troubleshooting</h2>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showGuide ? 'Hide Guide' : 'Show Guide'}
        </button>
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          {support.isSecure ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm">
            {support.isSecure ? 'HTTPS/Localhost' : 'HTTP (Camera blocked)'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {support.hasMediaDevices ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm">
            {support.hasMediaDevices ? 'Media API Supported' : 'Media API Not Supported'}
          </span>
        </div>
      </div>

      {showGuide && (
        <div className="space-y-4">
          {/* HTTPS Requirement */}
          {!support.isSecure && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="font-medium text-yellow-800">HTTPS Required</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Camera access requires HTTPS. Your app is running on HTTP.
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Solutions:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Use ngrok for HTTPS tunneling</li>
                      <li>Run with HTTPS locally: <code className="bg-yellow-100 px-1 rounded">npm run start-https</code></li>
                      <li>Use localhost (camera works on localhost even with HTTP)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Browser Support */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-blue-800">Browser Requirements</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Camera access works best with modern browsers.
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Recommended Browsers:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Google Chrome (latest version)</li>
                    <li>Mozilla Firefox (latest version)</li>
                    <li>Microsoft Edge (latest version)</li>
                    <li>Safari (latest version)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Common Issues */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Common Camera Issues</h3>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-gray-700">1. Camera Permission Denied</h4>
                <p className="text-gray-600">Click the camera icon in the address bar and allow access</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">2. Camera in Use by Another App</h4>
                <p className="text-gray-600">Close other apps that might be using the camera (Zoom, Teams, etc.)</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">3. No Camera Detected</h4>
                <p className="text-gray-600">Check if your device has a camera and it's not disabled</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">4. Browser Blocking Camera</h4>
                <p className="text-gray-600">Check browser settings and allow camera access for this site</p>
              </div>
            </div>
          </div>

          {/* Quick Fixes */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Quick Fixes</h3>
            <div className="space-y-2 text-sm">
              <button
                onClick={() => window.location.reload()}
                className="block w-full text-left p-2 bg-white rounded border hover:bg-gray-50"
              >
                🔄 Refresh the page and try again
              </button>
              
              <button
                onClick={() => {
                  navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                      stream.getTracks().forEach(track => track.stop());
                      alert('Camera access test successful!');
                    })
                    .catch(error => {
                      alert('Camera access test failed: ' + error.message);
                    });
                }}
                className="block w-full text-left p-2 bg-white rounded border hover:bg-gray-50"
              >
                📷 Test camera access manually
              </button>
              
              <a
                href="https://caniuse.com/?search=getusermedia"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left p-2 bg-white rounded border hover:bg-gray-50"
              >
                🌐 Check browser compatibility
                <ExternalLink className="h-3 w-3 inline ml-1" />
              </a>
            </div>
          </div>

          {/* Current Environment Info */}
          <div className="p-3 bg-gray-100 rounded text-xs">
            <h4 className="font-medium mb-1">Environment Info:</h4>
            <div className="space-y-1">
              <p><strong>Protocol:</strong> {support.protocol}</p>
              <p><strong>Hostname:</strong> {support.hostname}</p>
              <p><strong>Browser:</strong> {support.browser.split(' ')[0]}</p>
              <p><strong>MediaDevices API:</strong> {support.hasMediaDevices ? '✅' : '❌'}</p>
              <p><strong>getUserMedia:</strong> {support.hasGetUserMedia ? '✅' : '❌'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraTroubleshoot; 