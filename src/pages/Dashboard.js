import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Users, BookOpen, QrCode, Calendar, Mail, StopCircle } from 'lucide-react';
import { scannerAPI, studentsAPI, subjectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TokenDebug from '../components/TokenDebug';
import EmailNotification from '../components/EmailNotification';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    activeSessions: 0,
    todayAttendance: 0
  });
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('=== DASHBOARD DATA LOADING START ===');
      
      // Load data in parallel with better error handling
      const [studentsRes, subjectsRes, activeSessionsRes, todayRes] = await Promise.allSettled([
        studentsAPI.getAll(),
        subjectsAPI.getAll(),
        scannerAPI.getActiveSessions(),
        scannerAPI.getTodayOverview()
      ]);

      /*** 
      console.log('Raw API responses:', {
        students: studentsRes,
        subjects: subjectsRes,
        activeSessions: activeSessionsRes,
        today: todayRes
      });
      */
      // Extract data safely with fallbacks
      const students = studentsRes.status === 'fulfilled' ? (studentsRes.value?.data?.data || studentsRes.value?.data || []) : [];
      const subjects = subjectsRes.status === 'fulfilled' ? (subjectsRes.value?.data?.data || subjectsRes.value?.data || []) : [];
      const activeSessions = activeSessionsRes.status === 'fulfilled' ? (activeSessionsRes.value?.data?.data || activeSessionsRes.value?.data || []) : [];
      const todayData = todayRes.status === 'fulfilled' ? (todayRes.value?.data?.data || todayRes.value?.data || []) : [];

      console.log('Extracted data:', {
        students: students,
        subjects: subjects,
        activeSessions: activeSessions,
        todayData: todayData
      });

      console.log('Dashboard data loaded:', {
        students: students.length,
        subjects: subjects.length,
        activeSessions: activeSessions.length,
        todayData: todayData.length
      });

      setStats({
        totalStudents: Array.isArray(students) ? students.length : 0,
        totalSubjects: Array.isArray(subjects) ? subjects.length : 0,
        activeSessions: Array.isArray(activeSessions) ? activeSessions.length : 0,
        todayAttendance: Array.isArray(todayData) ? todayData.reduce((sum, subject) => sum + (subject.attendance_count || 0), 0) : 0
      });

      setActiveSessions(Array.isArray(activeSessions) ? activeSessions : []);
      console.log('=== DASHBOARD DATA LOADING END ===');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Set default values on error
      setStats({
        totalStudents: 0,
        totalSubjects: 0,
        activeSessions: 0,
        todayAttendance: 0
      });
      setActiveSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (sessionId) => {
    try {
      await scannerAPI.endSession(sessionId);
      toast.success('Scanning session ended successfully!');
      loadDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to end session');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your attendance management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <QrCode className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-info-100 rounded-lg">
              <Calendar className="h-6 w-6 text-info-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAttendance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/students"
              className="flex items-center p-4 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Users className="h-6 w-6 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-primary-900">Manage Students</p>
                <p className="text-sm text-primary-700">Add, edit, or view students</p>
              </div>
            </Link>
            
            <Link
              to="/subjects"
              className="flex items-center p-4 bg-success-50 border border-success-200 rounded-lg hover:bg-success-100 transition-colors"
            >
              <BookOpen className="h-6 w-6 text-success-600 mr-3" />
              <div>
                <p className="font-medium text-success-900">Manage Subjects</p>
                <p className="text-sm text-success-700">Add, edit, or view subjects</p>
              </div>
            </Link>
            
            <Link
              to="/scanner"
              className="flex items-center p-4 bg-warning-50 border border-warning-200 rounded-lg hover:bg-warning-100 transition-colors"
            >
              <QrCode className="h-6 w-6 text-warning-600 mr-3" />
              <div>
                <p className="font-medium text-warning-900">QR Scanner</p>
                <p className="text-sm text-warning-700">Scan student QR codes</p>
              </div>
            </Link>
            
            <Link
              to="/attendance"
              className="flex items-center p-4 bg-info-50 border border-info-200 rounded-lg hover:bg-info-100 transition-colors"
            >
              <Calendar className="h-6 w-6 text-info-600 mr-3" />
              <div>
                <p className="font-medium text-info-900">View Attendance</p>
                <p className="text-sm text-info-700">Check attendance records</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Email Quick Actions */}
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Management</h2>
            <div className="space-y-3">
              <Link
                to="/email-management"
                className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Mail className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-900">Email Management</p>
                  <p className="text-sm text-blue-700">Manage emails and preferences</p>
                </div>
              </Link>
              
              <EmailNotification />
            </div>
          </div>
        )}

        {/* Active Sessions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Scanning Sessions</h2>
          {activeSessions.length > 0 ? (
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-warning-50 border border-warning-200 rounded-lg">
                  <div>
                    <p className="font-medium text-warning-900">{session.subject_name}</p>
                    <p className="text-sm text-warning-700">
                      Started: {new Date(session.start_time).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEndSession(session.id)}
                    className="btn-danger text-sm"
                  >
                    <StopCircle className="h-4 w-4 mr-1" />
                    End
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active scanning sessions</p>
              <Link to="/scanner" className="btn-primary mt-4">
                Start Scanning
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Token Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <TokenDebug />
      )}
    </div>
  );
};

export default Dashboard; 