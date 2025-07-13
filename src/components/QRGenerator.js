import React, { useState } from 'react';
import { QrCode, Download } from 'lucide-react';

const QRGenerator = () => {
  const [studentId, setStudentId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const generateQR = () => {
    if (!studentId.trim()) {
      alert('Please enter a student ID');
      return;
    }

    // Generate QR code using a free API
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(studentId)}`;
    setQrCodeUrl(qrCodeApiUrl);
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-code-${studentId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code Generator (for testing)</h2>
      
      <div className="space-y-4">
        <div>
          <label className="label">Student ID</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student ID..."
              className="input flex-1"
            />
            <button
              onClick={generateQR}
              className="btn-primary"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Generate
            </button>
          </div>
        </div>

        {qrCodeUrl && (
          <div className="text-center space-y-4">
            <div className="bg-gray-100 rounded-lg p-4 inline-block">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="mx-auto"
              />
            </div>
            <div>
              <button
                onClick={downloadQR}
                className="btn-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator; 