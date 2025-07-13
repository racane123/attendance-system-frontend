import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, CameraOff, AlertTriangle, CheckCircle, RefreshCw, QrCode } from 'lucide-react';
import { stopAllCameraStreams, waitForCameraCleanup } from '../utils/cameraUtils';

const WorkingQRScanner = ({ onScan, onError, isActive = false }) => {
  const [scanStatus, setScanStatus] = useState('idle');
  const [cameraError, setCameraError] = useState('');
  const [scanner, setScanner] = useState(null);
  const scannerRef = useRef(null);

  const handleScanSuccess = (decodedText, decodedResult) => {
    console.log('QR Code detected:', decodedText);
    setScanStatus('success');
    
    if (onScan) {
      onScan(decodedText);
    }
    
    // Reset status after 2 seconds
    setTimeout(() => {
      setScanStatus('scanning');
    }, 2000);
  };

  const handleScanFailure = (error) => {
    // Only log errors, don't change status for normal scanning failures
    console.log('Scan failure (normal):', error);
  };

  const handleScannerError = (error) => {
    console.error('Scanner error:', error);
    setCameraError(`Scanner error: ${error.message || error}`);
    setScanStatus('error');
    
    if (onError) {
      onError(error);
    }
  };

  const retryScanner = async () => {
    setCameraError('');
    setScanStatus('idle');
    
    // Stop all camera streams first
    stopAllCameraStreams();
    await waitForCameraCleanup();
    
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
  };

  // Initialize scanner
  useEffect(() => {
    if (isActive && !scanner && scannerRef.current) {
      try {
        console.log('Initializing QR scanner...');
        
        // Clear any existing content
        scannerRef.current.innerHTML = '';
        
        // Create new scanner with simpler config
        const newScanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          false
        );

        // Render scanner
        newScanner.render(handleScanSuccess, handleScanFailure);
        setScanner(newScanner);
        setScanStatus('scanning');
        
        console.log('QR scanner initialized successfully');
      } catch (error) {
        console.error('Error initializing scanner:', error);
        handleScannerError(error);
      }
    }

    // Cleanup when scanner becomes inactive or component unmounts
    if (!isActive && scanner) {
      try {
        console.log('Cleaning up scanner...');
        scanner.clear();
        setScanner(null);
        setScanStatus('idle');
        // Stop all camera streams when scanner becomes inactive
        stopAllCameraStreams();
      } catch (error) {
        console.error('Error clearing scanner:', error);
      }
    }

    return () => {
      if (scanner) {
        try {
          console.log('Component unmounting, cleaning up scanner...');
          scanner.clear();
          setScanner(null);
        } catch (error) {
          console.error('Error clearing scanner:', error);
        }
      }
    };
  }, [isActive, scanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (error) {
          console.error('Error clearing scanner on unmount:', error);
        }
      }
    };
  }, [scanner]);

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
      
      {/* Troubleshooting */}
      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Troubleshooting:</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Allow camera permissions when prompted</li>
          <li>• Try refreshing the page if camera doesn't start</li>
          <li>• Check that QR codes are not damaged or blurry</li>
          <li>• Ensure you're using HTTPS or localhost for camera access</li>
        </ul>
      </div>
    </div>
  );
};

export default WorkingQRScanner; 