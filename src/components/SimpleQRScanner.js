import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, AlertTriangle, CheckCircle, RefreshCw, QrCode } from 'lucide-react';

const SimpleQRScanner = ({ onScan, onError, isActive = false }) => {
  const [scanStatus, setScanStatus] = useState('idle');
  const [cameraError, setCameraError] = useState('');
  const [scanner, setScanner] = useState(null);
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (scanner) {
        scanner.stop().catch(console.error);
      }
    };
  }, [scanner]);

  const handleScanSuccess = useCallback((decodedText, decodedResult) => {
    console.log('QR Code detected:', decodedText);
    setScanStatus('success');
    
    if (onScan) {
      onScan(decodedText);
    }
    
    // Reset status after 2 seconds
    setTimeout(() => {
      if (mountedRef.current) {
        setScanStatus('scanning');
      }
    }, 2000);
  }, [onScan]);

  const handleScanFailure = useCallback((error) => {
    // Only log errors, don't change status for normal scanning failures
    console.log('Scan failure (normal):', error);
  }, []);

  const startScanner = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setCameraError('');
      setScanStatus('idle');
      
      // Stop any existing scanner
      if (scanner) {
        await scanner.stop();
        setScanner(null);
      }
      
      if (!mountedRef.current) return;
      
      // Create new scanner
      const html5QrCode = new Html5Qrcode("qr-reader");
      
      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const cameraId = devices[0].id;
        
        // Start scanning
        await html5QrCode.start(
          { deviceId: cameraId },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          handleScanSuccess,
          handleScanFailure
        );
        
        setScanner(html5QrCode);
        setScanStatus('scanning');
      } else {
        throw new Error('No cameras found');
      }
    } catch (error) {
      if (mountedRef.current) {
        console.error('Scanner start error:', error);
        setCameraError(`Failed to start scanner: ${error.message}`);
        setScanStatus('error');
        
        if (onError) {
          onError(error);
        }
      }
    }
  }, [scanner, handleScanSuccess, handleScanFailure, onError]);

  const stopScanner = useCallback(async () => {
    if (scanner) {
      try {
        await scanner.stop();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      setScanner(null);
    }
    setScanStatus('idle');
  }, [scanner]);

  const retryScanner = useCallback(() => {
    setCameraError('');
    stopScanner().then(() => {
      if (mountedRef.current) {
        startScanner();
      }
    });
  }, [stopScanner, startScanner]);

  // Handle active state changes
  useEffect(() => {
    if (isActive && !scanner) {
      startScanner();
    } else if (!isActive && scanner) {
      stopScanner();
    }
  }, [isActive, scanner, startScanner, stopScanner]);

  if (!isActive) {
    return (
      <div className="text-center py-8">
        <CameraOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Scanner is not active</p>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{cameraError}</p>
        <button
          onClick={retryScanner}
          className="btn-primary"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Scanner
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* QR Scanner */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="relative">
          <div 
            ref={scannerRef}
            id="qr-reader"
            className="qr-scanner"
          />
          
          {/* Status overlay */}
          {scanStatus === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-20 rounded-lg">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-medium">QR Code Detected!</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Status indicator */}
        <div className="text-center mt-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {scanStatus === 'idle' && <Camera className="h-4 w-4 text-gray-400" />}
            {scanStatus === 'scanning' && <QrCode className="h-4 w-4 text-blue-500 animate-pulse" />}
            {scanStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {scanStatus === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
            
            <span className="text-sm text-gray-600">
              {scanStatus === 'idle' && 'Initializing scanner...'}
              {scanStatus === 'scanning' && 'Point camera at QR code'}
              {scanStatus === 'success' && 'QR code detected!'}
              {scanStatus === 'error' && 'Scanner error'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">How to use:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Point your camera at a QR code</li>
          <li>• Hold steady for best detection</li>
          <li>• Ensure good lighting conditions</li>
          <li>• Make sure QR code is clearly visible</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleQRScanner; 