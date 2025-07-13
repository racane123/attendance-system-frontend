import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const PWAStatus = () => {
  const [status, setStatus] = useState({
    isInstalled: false,
    isStandalone: false,
    hasServiceWorker: false,
    hasManifest: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPWAStatus();
  }, []);

  const checkPWAStatus = async () => {
    setIsLoading(true);
    
    try {
      // Check if app is installed/standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone === true;
      
      // Check if service worker is registered
      const hasServiceWorker = 'serviceWorker' in navigator && 
                              (await navigator.serviceWorker.getRegistrations()).length > 0;
      
      // Check if manifest is loaded
      const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
      
      setStatus({
        isInstalled: localStorage.getItem('pwa-installed') === 'true' || isStandalone,
        isStandalone,
        hasServiceWorker,
        hasManifest
      });
    } catch (error) {
      console.error('Error checking PWA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (condition) => {
    return condition ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">PWA Status</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium">App Installed</h3>
            <p className="text-sm text-gray-600">PWA is installed on device</p>
          </div>
          {getStatusIcon(status.isInstalled)}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium">Standalone Mode</h3>
            <p className="text-sm text-gray-600">Running as standalone app</p>
          </div>
          {getStatusIcon(status.isStandalone)}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium">Service Worker</h3>
            <p className="text-sm text-gray-600">Background sync enabled</p>
          </div>
          {getStatusIcon(status.hasServiceWorker)}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium">Web App Manifest</h3>
            <p className="text-sm text-gray-600">App metadata configured</p>
          </div>
          {getStatusIcon(status.hasManifest)}
        </div>

        <button
          onClick={checkPWAStatus}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default PWAStatus; 