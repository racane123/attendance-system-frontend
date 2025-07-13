import React, { useState, useEffect, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const WorkingQRScanner = ({ onScanSuccess, onScanError }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanSuccess = useCallback((decodedText, decodedResult) => {
    console.log('QR Code scanned:', decodedText);
    if (onScanSuccess) {
      onScanSuccess(decodedText, decodedResult);
    }
  }, [onScanSuccess]);

  const handleScannerError = useCallback((error) => {
    console.error('QR Scanner error:', error);
    if (onScanError) {
      onScanError(error);
    }
  }, [onScanError]);

  useEffect(() => {
    if (!scanner && !isScanning) {
      setIsScanning(true);
      
      const newScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      newScanner.render(handleScanSuccess, handleScannerError);
      setScanner(newScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear();
        setScanner(null);
      }
    };
  }, [scanner, isScanning, handleScanSuccess, handleScannerError]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">QR Code Scanner</h2>
      
      <div className="space-y-4">
        <div id="qr-reader" className="w-full"></div>
        
        {isScanning && (
          <div className="text-center text-sm text-gray-600">
            Point your camera at a QR code to scan
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkingQRScanner; 