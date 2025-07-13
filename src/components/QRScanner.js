import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, CameraOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const QRScanner = ({ onScan, onError, isActive = false }) => {
  const [scanner, setScanner] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const scannerRef = useRef(null);

  const checkCameraSupport = useCallback(() => {
    // Check if running on HTTPS or localhost
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    
    if (!isSecure) {
      setCameraError('Camera access requires HTTPS. Please use ngrok or localhost.');
      return false;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API not supported in this browser. Please use Chrome, Firefox, or Safari.');
      return false;
    }

    return true;
  }, []);

  const getAvailableCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);
      
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
      
      return videoDevices.length > 0;
    } catch (error) {
      console.error('Error getting camera devices:', error);
      setCameraError('Failed to get camera devices');
      return false;
    }
  }, []);

  const testCameraAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera access test failed:', error);
      setCameraError(`Camera access denied: ${error.message}`);
      return false;
    }
  }, [selectedDevice]);

  const initializeScanner = useCallback(async () => {
    setIsInitializing(true);
    setCameraError('');
    setDebugInfo('Starting initialization...');

    try {
      // Check camera support
      if (!checkCameraSupport()) {
        setIsInitializing(false);
        return;
      }

      setDebugInfo('Checking camera support...');

      // Get available cameras
      const hasCameras = await getAvailableCameras();
      if (!hasCameras) {
        setCameraError('No camera devices found');
        setIsInitializing(false);
        return;
      }

      setDebugInfo('Testing camera access...');

      // Test camera access
      const hasAccess = await testCameraAccess();
      if (!hasAccess) {
        setIsInitializing(false);
        return;
      }

      setDebugInfo('Initializing HTML5 QR Scanner...');

      // Initialize HTML5 QR Scanner
      if (scannerRef.current) {
        // Clear any existing scanner
        if (scanner) {
          try {
            scanner.clear();
          } catch (error) {
            console.log('Error clearing existing scanner:', error);
          }
        }

        const html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
            defaultZoomValueIfSupported: 2,
            rememberLastUsedCamera: true,
            supportedFormats: []
          },
          false
        );
        
        setDebugInfo('Setting up scanner callbacks...');
        
        html5QrcodeScanner.render(
          (decodedText) => {
            console.log('QR Code scanned:', decodedText);
            setDebugInfo(`QR Code detected: ${decodedText}`);
            if (onScan) {
              onScan(decodedText);
            }
          }, 
          (error) => {
            // Handle scan errors silently
            console.log('Scan error:', error);
            setDebugInfo(`Scan error: ${error}`);
          }
        );
        
        setScanner(html5QrcodeScanner);
        setCameraPermission(true);
        setDebugInfo('Scanner initialized successfully!');
        console.log('QR Scanner initialized successfully');
      } else {
        setCameraError('Scanner container not found');
      }
    } catch (error) {
      console.error('Scanner initialization error:', error);
      setCameraError(`Failed to initialize scanner: ${error.message}`);
      setDebugInfo(`Initialization failed: ${error.message}`);
    } finally {
      setIsInitializing(false);
    }
  }, [checkCameraSupport, getAvailableCameras, testCameraAccess, scanner, onScan]);

  useEffect(() => {
    if (isActive && !scanner) {
      initializeScanner();
    }
    
    // Cleanup when scanner becomes inactive
    if (!isActive && scanner) {
      try {
        console.log('Cleaning up QRScanner...');
        scanner.clear();
        setScanner(null);
        setCameraPermission(false);
        setDebugInfo('Scanner stopped');
      } catch (error) {
        console.log('Error clearing scanner:', error);
      }
    }
    
    return () => {
      if (scanner) {
        try {
          console.log('Component unmounting, cleaning up QRScanner...');
          scanner.clear();
          setScanner(null);
        } catch (error) {
          console.log('Error clearing scanner:', error);
        }
      }
    };
  }, [isActive, scanner, initializeScanner]);

  const stopScanner = useCallback(() => {
    if (scanner) {
      try {
        scanner.clear();
      } catch (error) {
        console.log('Error stopping scanner:', error);
      }
      setScanner(null);
      setCameraPermission(false);
      setDebugInfo('Scanner stopped');
    }
  }, [scanner]);

  const retryCameraAccess = useCallback(async () => {
    setCameraError('');
    setCameraPermission(false);
    setDebugInfo('Retrying camera access...');
    if (scanner) {
      stopScanner();
    }
    await initializeScanner();
  }, [scanner, stopScanner, initializeScanner]);

  const handleDeviceChange = useCallback(async (deviceId) => {
    setSelectedDevice(deviceId);
    setDebugInfo(`Switching to camera: ${deviceId}`);
    if (scanner) {
      stopScanner();
      await initializeScanner();
    }
  }, [scanner, stopScanner, initializeScanner]);

  if (!isActive) {
    return (
      <div className="text-center py-8">
        <CameraOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Scanner is not active</p>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing camera...</p>
        {debugInfo && (
          <p className="text-xs text-gray-500 mt-2">{debugInfo}</p>
        )}
      </div>
    );
  }

  if (cameraError) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{cameraError}</p>
        
        {/* Camera device selection */}
        {availableDevices.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Camera:
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <button
          onClick={retryCameraAccess}
          className="btn-primary"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Camera Access
        </button>
        
        {/* Troubleshooting tips */}
        <div className="mt-4 text-left text-sm text-gray-600">
          <h4 className="font-medium mb-2">Troubleshooting:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Make sure you're using HTTPS or localhost</li>
            <li>Allow camera access when prompted</li>
            <li>Check if another app is using the camera</li>
            <li>Try refreshing the page</li>
            <li>Use Chrome, Firefox, or Safari</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!cameraPermission) {
    return (
      <div className="text-center py-8">
        <CameraOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Camera permission required</p>
        <button
          onClick={retryCameraAccess}
          className="btn-primary"
        >
          <Camera className="h-4 w-4 mr-2" />
          Enable Camera
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera device selection */}
      {availableDevices.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Camera:
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* QR Scanner */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div id="qr-reader" ref={scannerRef}></div>
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">Point camera at QR code</p>
          <button
            onClick={stopScanner}
            className="btn-secondary mt-2"
          >
            Stop Scanner
          </button>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>Camera active and ready to scan</span>
      </div>
      
      {/* Debug info */}
      {debugInfo && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>Debug:</strong> {debugInfo}
        </div>
      )}
    </div>
  );
};

export default QRScanner; 