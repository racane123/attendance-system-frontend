import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Smartphone, Database } from 'lucide-react';
import offlineStorage from '../utils/offlineStorage';

const PWAStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState('unknown');
  const [storageInfo, setStorageInfo] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check standalone mode
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
      setIsStandalone(standalone);
    };

    // Check service worker status
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            setServiceWorkerStatus('registered');
          } else {
            setServiceWorkerStatus('not-registered');
          }
        } catch (error) {
          setServiceWorkerStatus('error');
        }
      } else {
        setServiceWorkerStatus('not-supported');
      }
    };

    // Get storage info
    const getStorageInfo = async () => {
      try {
        const info = await offlineStorage.getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        console.error('Error getting storage info:', error);
      }
    };

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    // Initial checks
    checkStandalone();
    checkServiceWorker();
    getStorageInfo();

    // Periodic storage info update
    const interval = setInterval(getStorageInfo, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'registered':
      case 'online':
        return 'text-green-600';
      case 'not-registered':
      case 'offline':
        return 'text-red-600';
      case 'not-supported':
        return 'text-gray-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4" />;
      case 'offline':
        return <WifiOff className="h-4 w-4" />;
      case 'registered':
        return <Download className="h-4 w-4" />;
      case 'not-registered':
        return <Download className="h-4 w-4" />;
      default:
        return <Smartphone className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'registered':
        return 'SW Active';
      case 'not-registered':
        return 'SW Inactive';
      case 'not-supported':
        return 'SW Not Supported';
      case 'error':
        return 'SW Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center space-x-3">
          {/* Online Status */}
          <div className={`flex items-center space-x-1 ${getStatusColor(isOnline ? 'online' : 'offline')}`}>
            {getStatusIcon(isOnline ? 'online' : 'offline')}
            <span className="text-xs font-medium">
              {getStatusText(isOnline ? 'online' : 'offline')}
            </span>
          </div>

          {/* Service Worker Status */}
          <div className={`flex items-center space-x-1 ${getStatusColor(serviceWorkerStatus)}`}>
            {getStatusIcon(serviceWorkerStatus)}
            <span className="text-xs font-medium">
              {getStatusText(serviceWorkerStatus)}
            </span>
          </div>

          {/* Standalone Mode */}
          {isStandalone && (
            <div className="flex items-center space-x-1 text-blue-600">
              <Smartphone className="h-4 w-4" />
              <span className="text-xs font-medium">PWA</span>
            </div>
          )}

          {/* Toggle Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Database className="h-4 w-4" />
          </button>
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Display Mode:</span>
                <span className="font-medium">
                  {isStandalone ? 'Standalone' : 'Browser'}
                </span>
              </div>
              
              {storageInfo && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{storageInfo.students || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subjects:</span>
                    <span className="font-medium">{storageInfo.subjects || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attendance:</span>
                    <span className="font-medium">{storageInfo.attendance || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-medium">{storageInfo.pendingActions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cache:</span>
                    <span className="font-medium">{storageInfo.cache || 0}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Protocol:</span>
                <span className="font-medium">{window.location.protocol}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">User Agent:</span>
                <span className="font-medium text-xs truncate max-w-32">
                  {navigator.userAgent.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAStatus; 