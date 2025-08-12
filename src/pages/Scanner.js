import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { stopAllCameraStreams } from '../utils/cameraUtils';
import { 
  QrCode, 
  Play, 
  StopCircle, 
  CheckCircle, 
  XCircle,
  Users
} from 'lucide-react';
import { scannerAPI, subjectsAPI } from '../services/api';
import QRTestGenerator from '../components/QRTestGenerator';
import CameraTest from '../components/CameraTest';
import CameraTroubleshoot from '../components/CameraTroubleshoot';
import NgrokWarning from '../components/NgrokWarning';
import QRScanner from '../components/QRScanner';
import SimpleQRScanner from '../components/SimpleQRScanner';
import ReliableQRScanner from '../components/ReliableQRScanner';
import ModernQRScanner from '../components/ModernQRScanner';
import WorkingQRScanner from '../components/WorkingQRScanner';
import ManualAttendance from '../components/ManualAttendance';

const Scanner = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ngrokWarning, setNgrokWarning] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');
  const [scannerType, setScannerType] = useState('working'); // 'working', 'modern', 'html5', 'simple', or 'reliable'
  const [showManualAttendance, setShowManualAttendance] = useState(false);
  const [showCameraTools, setShowCameraTools] = useState(false);

  useEffect(() => {
    loadSubjects();
    checkActiveSessions();
    
    // Cleanup camera streams when component unmounts
    return () => {
      stopAllCameraStreams();
    };
  }, []);

  const loadSubjects = async () => {
    try {
      console.log('Loading subjects...');
      const response = await subjectsAPI.getAll();
      console.log('Subjects API response:', response);
      
      // Handle both possible response structures
      const subjectsData = response.data?.data || response.data || [];
      console.log('Processed subjects data:', subjectsData);
      setSubjects(subjectsData);
      setNgrokWarning(false); // Clear any previous ngrok warnings
    } catch (error) {
      console.error('Error loading subjects:', error);
      console.error('Error response:', error.response);
      
      // Check if it's an ngrok warning
      if (error.message && error.message.includes('Ngrok warning page detected')) {
        setNgrokWarning(true);
        setBackendUrl(localStorage.getItem('backendApiUrl') || 'http://localhost:5000/api');
        toast.error('Ngrok warning detected. Please accept the warning on the backend URL first.');
      } else {
        toast.error('Failed to load subjects');
        setSubjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkActiveSessions = async () => {
    try {
      const response = await scannerAPI.getActiveSessions();
      if (response.data.data.length > 0) {
        setActiveSession(response.data.data[0]);
        setSelectedSubject(response.data.data[0].subject_id);
      }
    } catch (error) {
      console.error('Error checking active sessions:', error);
    }
  };

  const handleStartSession = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }

    try {
      const response = await scannerAPI.startSession(selectedSubject);
      setActiveSession(response.data.data);
      toast.success('Scanning session started successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start session');
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      await scannerAPI.endSession(activeSession.id);
      setActiveSession(null);
      setSelectedSubject('');
      
      // Clean up camera streams when session ends
      stopAllCameraStreams();
      
      toast.success('Scanning session ended successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to end session');
    }
  };

  const handleScan = async (qrCode) => {
    if (!activeSession) {
      toast.error('No active scanning session');
      return;
    }

    try {
      const response = await scannerAPI.scanQR(qrCode, activeSession.subject_id);
      setScanResult({
        success: true,
        student: response.data.data.student,
        attendance: response.data.data.attendance
      });
      toast.success('Attendance recorded successfully!');
      
      // Clear result after 3 seconds
      setTimeout(() => setScanResult(null), 3000);
    } catch (error) {
      setScanResult({
        success: false,
        error: error.response?.data?.error || 'Scan failed'
      });
      toast.error(error.response?.data?.error || 'Failed to record attendance');
      
      // Clear result after 3 seconds
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Safety check for subjects
  if (!subjects || !Array.isArray(subjects)) {
    if (ngrokWarning) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
            <p className="mt-2 text-gray-600">Scan student QR codes to record attendance</p>
          </div>
          <NgrokWarning 
            backendUrl={backendUrl} 
            onRetry={() => {
              setLoading(true);
              setNgrokWarning(false);
              loadSubjects();
            }} 
          />
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load subjects</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
        <p className="mt-2 text-gray-600">Scan student QR codes to record attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Management */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Management</h2>
          
          {!activeSession ? (
            <div className="space-y-4">
              <div>
                <label className="label">Select Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    /***console.log('Subject selected:', e.target.value);*/
                    setSelectedSubject(e.target.value);
                  }}
                  className="input"
                >
                  <option value="">Choose a subject...</option>
                  {subjects && subjects.length > 0 ? subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  )) : (
                    <option value="" disabled>No subjects available</option>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Selected Subject ID: {selectedSubject || 'None'}
                </p>
              </div>
              
              <button
                onClick={handleStartSession}
                disabled={!selectedSubject}
                className="btn-success w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Scanning Session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
                  <span className="font-medium text-success-800">Active Session</span>
                </div>
                <p className="text-sm text-success-700 mt-1">
                  Subject: {subjects && subjects.find(s => s.id === activeSession.subject_id)?.name}
                </p>
                <p className="text-sm text-success-700">
                  Started: {new Date(activeSession.start_time).toLocaleTimeString()}
                </p>
              </div>
              
              <button
                onClick={handleEndSession}
                className="btn-danger w-full"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                End Session
              </button>
            </div>
          )}
        </div>

        {/* Scanner Interface */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code Scanner</h2>
          
          {!activeSession ? (
            <div className="text-center py-12">
              <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Start a scanning session to begin</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Scanner Type Selection */}
              <div>
                <label className="label">Scanner Type</label>
                <select
                  value={scannerType}
                  onChange={(e) => setScannerType(e.target.value)}
                  className="input"
                >
                  <option value="working">Working QR Scanner (Recommended)</option>
                  <option value="modern">Modern QR Scanner</option>
                  <option value="html5">HTML5 QR Scanner</option>
                  <option value="simple">Simple Camera View</option>
                  <option value="reliable">Reliable Camera View</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {scannerType === 'working' && 'Reliable QR code scanning with HTML5 library (Recommended)'}
                  {scannerType === 'modern' && 'Modern QR Scanner with advanced features'}
                  {scannerType === 'html5' && 'Full QR code scanning with HTML5 library'}
                  {scannerType === 'simple' && 'Basic camera view for testing'}
                  {scannerType === 'reliable' && 'Stable camera view with manual QR input'}
                </p>
              </div>
              
              {/* Scanner Component */}
              {scannerType === 'html5' ? (
                <QRScanner 
                  onScan={handleScan}
                  onError={(error) => {
                    console.error('Scanner error:', error);
                    toast.error('Scanner error: ' + error);
                  }}
                  isActive={!!activeSession}
                />
              ) : scannerType === 'simple' ? (
                <SimpleQRScanner 
                  onScan={handleScan}
                  onError={(error) => {
                    console.error('Simple scanner error:', error);
                    toast.error('Simple scanner error: ' + error);
                  }}
                  isActive={!!activeSession}
                />
              ) : scannerType === 'reliable' ? (
                <ReliableQRScanner 
                  onScan={handleScan}
                  onError={(error) => {
                    console.error('Reliable scanner error:', error);
                    toast.error('Reliable scanner error: ' + error);
                  }}
                  isActive={!!activeSession}
                />
              ) : scannerType === 'working' ? (
                <WorkingQRScanner 
                  onScan={handleScan}
                  onError={(error) => {
                    console.error('Working scanner error:', error);
                    toast.error('Working scanner error: ' + error);
                  }}
                  isActive={!!activeSession}
                />
              ) : (
                <ModernQRScanner 
                  onScan={handleScan}
                  onError={(error) => {
                    console.error('Modern scanner error:', error);
                    toast.error('Modern scanner error: ' + error);
                  }}
                  isActive={!!activeSession}
                />
              )}
              
              {/* Manual QR Input for testing */}
              <div>
                <label className="label">Manual QR Code Input (for testing)</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter QR code..."
                    className="input flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleScan(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      if (input.value) {
                        handleScan(input.value);
                        input.value = '';
                      }
                    }}
                    className="btn-primary"
                  >
                    Scan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Attendance Section */}
      {selectedSubject && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-600" />
              Manual Attendance Management
            </h2>
            <button
              onClick={() => setShowManualAttendance(!showManualAttendance)}
              className="btn-primary"
            >
              {showManualAttendance ? 'Hide Manual Attendance' : 'Show Manual Attendance'}
            </button>
          </div>
          
          {showManualAttendance && (
            <div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Debug Info:</strong> Subject ID: {selectedSubject}, 
                  Subject Name: {subjects.find(s => s.id === selectedSubject)?.name || 'Unknown'}
                </p>
              </div>
              <ManualAttendance
                subjectId={selectedSubject}
                subjectName={subjects.find(s => s.id === selectedSubject)?.name || 'Unknown Subject'}
                onAttendanceUpdate={() => {
                  // Refresh scan result if needed
                  if (scanResult) {
                    setScanResult(null);
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Scan Result */}
      {scanResult && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scan Result</h2>
          
          {scanResult.success ? (
            <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
                <span className="font-medium text-success-800">Attendance Recorded Successfully!</span>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Student:</strong> {scanResult.student.first_name} {scanResult.student.middle_name ? scanResult.student.middle_name + ' ' : ''}{scanResult.student.last_name}</p>
                <p><strong>Student ID:</strong> {scanResult.student.student_id}</p>
                <p><strong>Time:</strong> {new Date(scanResult.attendance.time_in).toLocaleTimeString()}</p>
                <p><strong>Status:</strong> {scanResult.attendance.status}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <div className="flex items-center mb-2">
                <XCircle className="h-5 w-5 text-danger-600 mr-2" />
                <span className="font-medium text-danger-800">Scan Failed</span>
              </div>
              <p className="text-sm text-danger-700">{scanResult.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Camera Test - Only show when needed */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Camera Testing & Troubleshooting</h2>
          <button
            onClick={() => setShowCameraTools(!showCameraTools)}
            className="btn-secondary"
          >
            {showCameraTools ? 'Hide Camera Tools' : 'Show Camera Tools'}
          </button>
        </div>
        
        {showCameraTools && (
          <div className="space-y-6">
            <CameraTest isActiveSession={!!activeSession} />
            <CameraTroubleshoot />
            <QRTestGenerator />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</div>
              <span className="font-medium">Select Subject</span>
            </div>
            <p className="text-gray-600 ml-8">Choose the subject for which you want to take attendance</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</div>
              <span className="font-medium">Start Session</span>
            </div>
            <p className="text-gray-600 ml-8">Click "Start Scanning Session" to begin</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</div>
              <span className="font-medium">Scan QR Codes</span>
            </div>
            <p className="text-gray-600 ml-8">Point camera at student QR codes or enter manually</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">4</div>
              <span className="font-medium">Manual Attendance</span>
            </div>
            <p className="text-gray-600 ml-8">Use manual attendance for absent students or corrections</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner; 