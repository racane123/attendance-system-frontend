import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, CameraOff, AlertTriangle, CheckCircle, RefreshCw, QrCode, Settings } from 'lucide-react';

const ModernQRScanner = ({ onScan, onError, isActive = false }) => {
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success, error
  const [cameraError, setCameraError] = useState('');
  const [scannerConfig, setScannerConfig] = useState({
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    disableFlip: false,
  });
  
  const scannerRef = useRef(null);
  const scannerContainerRef = useRef(null);

  const handleScanSuccess = useCallback((decodedText, decodedResult) => {
    console.log('QR Code detected:', decodedText);
    setScanStatus('success');
    
    if (onScan) {
      onScan(decodedText);
    }
    
    // Reset status after 2 seconds
    setTimeout(() => {
      setScanStatus('scanning');
    }, 2000);
  }, [onScan]);

  const handleScanFailure = useCallback((error) => {
    // Only log errors, don't change status for normal scanning failures
    console.log('Scan failure (normal):', error);
  }, []);

  const handleScannerError = useCallback((error) => {
    console.error('Scanner error:', error);
    setCameraError(`Scanner error: ${error.message || error}`);
    setScanStatus('error');
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  const handleScannerStart = useCallback(() => {
    console.log('Scanner started');
    setScanStatus('scanning');
    setCameraError('');
  }, []);

  const handleScannerStop = useCallback(() => {
    console.log('Scanner stopped');
    setScanStatus('idle');
  }, []);

  const retryScanner = useCallback(() => {
    setCameraError('');
    setScanStatus('idle');
    // The scanner will automatically restart when isActive changes
  }, []);

  // Initialize scanner
  useEffect(() => {
    if (isActive && scannerContainerRef.current && !scannerRef.current) {
      try {
        // Clear any existing content
        scannerContainerRef.current.innerHTML = '';
        
        // Create new scanner
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: scannerConfig.fps,
            qrbox: scannerConfig.qrbox,
            aspectRatio: scannerConfig.aspectRatio,
            disableFlip: scannerConfig.disableFlip,
          },
          false
        );

        // Render scanner
        scannerRef.current.render(handleScanSuccess, handleScanFailure);
        
        // Add event listeners
        const scannerElement = document.getElementById('qr-reader');
        if (scannerElement) {
          scannerElement.addEventListener('scanner-start', handleScannerStart);
          scannerElement.addEventListener('scanner-stop', handleScannerStop);
        }
        
        handleScannerStart();
      } catch (error) {
        console.error('Error initializing scanner:', error);
        handleScannerError(error);
      }
    }

    // Cleanup when scanner becomes inactive
    if (!isActive && scannerRef.current) {
      try {
        console.log('Cleaning up ModernQRScanner...');
        scannerRef.current.clear();
        scannerRef.current = null;
        setScanStatus('idle');
      } catch (error) {
        console.error('Error clearing scanner:', error);
      }
    }

    return () => {
      if (scannerRef.current) {
        try {
          console.log('Component unmounting, cleaning up ModernQRScanner...');
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (error) {
          console.error('Error clearing scanner:', error);
        }
      }
    };
  }, [isActive, scannerConfig, handleScanSuccess, handleScanFailure, handleScannerStart, handleScannerStop, handleScannerError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error('Error clearing scanner on unmount:', error);
        }
      }
    };
  }, []);

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
      {/* Scanner Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Scanner Settings
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              FPS
            </label>
            <select
              value={scannerConfig.fps}
              onChange={(e) => setScannerConfig(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={5}>5 FPS</option>
              <option value={10}>10 FPS</option>
              <option value={15}>15 FPS</option>
              <option value={30}>30 FPS</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              QR Box Size
            </label>
            <select
              value={scannerConfig.qrbox.width}
              onChange={(e) => {
                const size = parseInt(e.target.value);
                setScannerConfig(prev => ({ 
                  ...prev, 
                  qrbox: { width: size, height: size } 
                }));
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={200}>200px</option>
              <option value={250}>250px</option>
              <option value={300}>300px</option>
              <option value={350}>350px</option>
            </select>
          </div>
        </div>
      </div>

      {/* QR Scanner */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="relative">
          <div 
            ref={scannerContainerRef}
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
          <li>• Adjust FPS if scanning is too slow/fast</li>
        </ul>
      </div>
      
      {/* Status indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>Modern QR scanner active with real-time detection</span>
      </div>
    </div>
  );
};

export default ModernQRScanner; 