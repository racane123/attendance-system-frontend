import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  Mail
} from 'lucide-react';
import { scannerAPI, subjectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import EmailNotification from '../components/EmailNotification';

const Reports = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject && startDate && endDate) {
      loadAttendanceSummary();
    }
  }, [selectedSubject, startDate, endDate]);

  const loadSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedSubject(response.data.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceSummary = async () => {
    try {
      const response = await scannerAPI.getAttendanceSummary(selectedSubject, startDate, endDate);
      setAttendanceSummary(response.data.data);
    } catch (error) {
      console.error('Error loading attendance summary:', error);
      setAttendanceSummary([]);
    }
  };

  const calculateAttendanceRate = (present, total) => {
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  };

  const exportReport = () => {
    if (attendanceSummary.length === 0) {
      toast.error('No data to export');
      return;
    }

    const subject = subjects.find(s => s.id === parseInt(selectedSubject));
    const headers = ['Date', 'Total Students', 'Present', 'Absent', 'Attendance Rate (%)'];
    const csvContent = [
      headers.join(','),
      ...attendanceSummary.map(record => [
        record.date,
        record.total_attendance,
        record.present_count,
        record.absent_count,
        calculateAttendanceRate(record.present_count, record.total_attendance)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${subject?.name}-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getAverageAttendanceRate = () => {
    if (attendanceSummary.length === 0) return 0;
    const totalRate = attendanceSummary.reduce((sum, record) => {
      return sum + calculateAttendanceRate(record.present_count, record.total_attendance);
    }, 0);
    return Math.round(totalRate / attendanceSummary.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
        <p className="mt-2 text-gray-600">View attendance analytics and generate reports</p>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input"
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={exportReport}
              className="btn-secondary w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {attendanceSummary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceSummary.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{getAverageAttendanceRate()}%</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Present</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceSummary.reduce((sum, record) => sum + record.present_count, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-danger-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Absent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceSummary.reduce((sum, record) => sum + record.absent_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Chart */}
      {attendanceSummary.length > 0 ? (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Attendance Trend - {subjects.find(s => s.id === parseInt(selectedSubject))?.name}
          </h2>
          
          <div className="space-y-4">
            {attendanceSummary.map((record) => {
              const attendanceRate = calculateAttendanceRate(record.present_count, record.total_attendance);
              return (
                <div key={record.date} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {record.present_count} present, {record.absent_count} absent
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{attendanceRate}%</p>
                      <p className="text-sm text-gray-600">attendance rate</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {selectedSubject && startDate && endDate 
              ? 'No attendance data found for the selected period'
              : 'Select a subject and date range to view reports'
            }
          </p>
        </div>
      )}

      {/* Email Actions */}
      {(user?.role === 'admin' || user?.role === 'teacher') && attendanceSummary.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Quick Email Actions</h3>
              <EmailNotification 
                type="attendance_report"
                recipientEmail=""
                subject={`Attendance Report - ${subjects.find(s => s.id === parseInt(selectedSubject))?.name}`}
                message={`Attendance report for ${subjects.find(s => s.id === parseInt(selectedSubject))?.name} from ${startDate} to ${endDate}`}
              />
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Report Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {subjects.find(s => s.id === parseInt(selectedSubject))?.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Period:</strong> {startDate} to {endDate}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Total Days:</strong> {attendanceSummary.length}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Average Attendance:</strong> {getAverageAttendanceRate()}%
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Total Present:</strong> {attendanceSummary.reduce((sum, record) => sum + record.present_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How to Generate Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</div>
              <span className="font-medium">Select Subject</span>
            </div>
            <p className="text-gray-600 ml-8">Choose the subject you want to analyze</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</div>
              <span className="font-medium">Set Date Range</span>
            </div>
            <p className="text-gray-600 ml-8">Select start and end dates for the report period</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</div>
              <span className="font-medium">Export Report</span>
            </div>
            <p className="text-gray-600 ml-8">Download the report as CSV for further analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 