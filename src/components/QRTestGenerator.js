import React, { useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, CheckCircle } from 'lucide-react';

const QRTestGenerator = () => {
  const [qrData, setQrData] = useState('STUDENT_001');
  const [qrImage, setQrImage] = useState('');
  const [copied, setCopied] = useState(false);

  const generateQR = async () => {
    try {
      const qrImageData = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrImage(qrImageData);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadQR = () => {
    if (qrImage) {
      const link = document.createElement('a');
      link.href = qrImage;
      link.download = `qr-${qrData}.png`;
      link.click();
    }
  };

  // Generate QR on component mount
  React.useEffect(() => {
    generateQR();
  }, [qrData]);

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <QrCode className="h-5 w-5 mr-2 text-primary-600" />
        QR Code Test Generator
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="label">QR Code Data</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              placeholder="Enter data for QR code..."
              className="input flex-1"
            />
            <button
              onClick={copyToClipboard}
              className="btn-secondary flex items-center"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use this to test your QR scanner. Try scanning this QR code with your camera.
          </p>
        </div>

        {qrImage && (
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border inline-block">
              <img 
                src={qrImage} 
                alt="QR Code" 
                className="w-64 h-64 mx-auto"
              />
            </div>
            
            <div className="mt-4 space-x-2">
              <button
                onClick={downloadQR}
                className="btn-primary flex items-center mx-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </button>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Test Instructions:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Enter student ID or any test data above</li>
            <li>• The QR code will be generated automatically</li>
            <li>• Use your phone to scan this QR code</li>
            <li>• Or download the QR code and display it on another device</li>
            <li>• Test the scanner with the generated QR code</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Sample Test Data:</h4>
          <div className="grid grid-cols-2 gap-2">
            {['STUDENT_001', 'STUDENT_002', 'STUDENT_003', 'STUDENT_004'].map((id) => (
              <button
                key={id}
                onClick={() => setQrData(id)}
                className="text-xs bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded border"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRTestGenerator; 