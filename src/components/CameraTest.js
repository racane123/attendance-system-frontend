import React, { useState } from 'react';
import { Camera, CameraOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { safeCameraInit } from '../utils/cameraUtils';

const CameraTest = ({ isActiveSession = false }) => {
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [error, setError] = useState('');
  const [devices, setDevices] = useState([]);

  // Don't automatically check camera access on mount to avoid conflicts
  // useEffect(() => {
  //   checkCameraAccess();
  // }, []);

  const checkCameraAccess = async () => {
    try {
      setCameraStatus('checking');
      setError('');
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('not-supported');
        setError('Camera API not supported in this browser');
        return;
      }
      // Check available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length === 0) {
        setCameraStatus('no-devices');
        setError('No camera devices found');
        return;
      }
      // Use safe camera initialization
      const stream = await safeCameraInit({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      // If successful, stop the stream
      stream.getTracks().forEach(track => track.stop());
      setCameraStatus('success');
      setError('');
    } catch (err) {
      setCameraStatus('error');
      setError(err.message);
    }
  };

  const getStatusIcon = () => {
    switch (cameraStatus) {
      case 'checking':
        return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'error':
      case 'not-supported':
      case 'no-devices':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default:
        return <CameraOff className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (cameraStatus) {
      case 'checking':
        return 'Checking camera access...';
      case 'success':
        return 'Camera access granted!';
      case 'error':
        return 'Camera access denied';
      case 'not-supported':
        return 'Camera API not supported';
      case 'no-devices':
        return 'No camera devices found';
      default:
        return 'Unknown status';
    }
  };

  const getSolutions = () => {
    if (cameraStatus === 'error') {
      return (
        <div className="mt-4 space-y-2 text-sm">
          <h4 className="font-medium text-gray-900">Solutions:</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Check if your browser allows camera access</li>
            <li>Look for the camera icon in the address bar and click it</li>
            <li>Make sure no other app is using the camera</li>
            <li>Try refreshing the page and allowing camera access</li>
            <li>Check your browser's privacy settings</li>
            <li>Try a different browser (Chrome, Firefox, Safari)</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Camera Access Test</h2>
      
      {/* Warning about camera conflicts */}
      {isActiveSession ? (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> There is an active scanning session. 
            Please end the session before running this camera test to avoid conflicts.
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This test may interfere with the main QR scanner. 
            Please stop any active scanning session before running this test.
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className="font-medium">{getStatusText()}</p>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        {/* Available Devices */}
        {devices.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Available Cameras:</h4>
            <ul className="space-y-1">
              {devices.map((device, index) => (
                <li key={device.deviceId} className="text-sm text-gray-600">
                  {index + 1}. {device.label || `Camera ${index + 1}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Solutions */}
        {getSolutions()}

        {/* Retry Button */}
        <button
          onClick={checkCameraAccess}
          className="btn-primary"
        >
          <Camera className="h-4 w-4 mr-2" />
          Retry Camera Test
        </button>

        {/* Browser Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Browser Information:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Browser:</strong> {navigator.userAgent}</p>
            <p><strong>Protocol:</strong> {window.location.protocol}</p>
            <p><strong>URL:</strong> {window.location.href}</p>
            <p><strong>MediaDevices API:</strong> {navigator.mediaDevices ? 'Supported' : 'Not Supported'}</p>
            <p><strong>getUserMedia:</strong> {navigator.mediaDevices?.getUserMedia ? 'Supported' : 'Not Supported'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraTest; 