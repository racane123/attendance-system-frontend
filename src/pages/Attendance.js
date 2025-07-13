import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Search,
  Filter,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import { scannerAPI, subjectsAPI } from '../services/api';

const Attendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadAttendanceRecords();
    }
  }, [selectedSubject, selectedDate]);

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

  const loadAttendanceRecords = async () => {
    try {
      const response = await scannerAPI.getAttendance(selectedSubject, selectedDate);
      setAttendanceRecords(response.data.data);
    } catch (error) {
      console.error('Error loading attendance records:', error);
      setAttendanceRecords([]);
    }
  };

  const handleStatusUpdate = async (recordId, newStatus) => {
    try {
      await scannerAPI.updateAttendance(recordId, newStatus);
      toast.success('Attendance status updated successfully!');
      loadAttendanceRecords();
    } catch (error) {
      toast.error('Failed to update attendance status');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await scannerAPI.deleteAttendance(recordId);
        toast.success('Attendance record deleted successfully!');
        loadAttendanceRecords();
      } catch (error) {
        toast.error('Failed to delete attendance record');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-success-100 text-success-800';
      case 'absent':
        return 'bg-danger-100 text-danger-800';
      case 'late':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const studentName = `${record.student_name}`.toLowerCase();
    const studentId = record.student_number.toLowerCase();
    return studentName.includes(searchLower) || studentId.includes(searchLower);
  });

  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error('No data to export');
      return;
    }

    const subject = subjects.find(s => s.id === parseInt(selectedSubject));
    const headers = ['Student ID', 'Student Name', 'Email', 'Time In', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        record.student_number,
        record.student_name,
        record.email,
        new Date(record.time_in).toLocaleTimeString(),
        record.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${subject?.name}-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
        <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
        <p className="mt-2 text-gray-600">View and manage student attendance</p>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="label">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={exportToCSV}
              className="btn-secondary w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Attendance Records */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Attendance for {subjects.find(s => s.id === parseInt(selectedSubject))?.name} - {new Date(selectedDate).toLocaleDateString()}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredRecords.length} student{filteredRecords.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No attendance records found for this date</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.student_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.student_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.time_in).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={record.status}
                        onChange={(e) => handleStatusUpdate(record.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(record.status)}`}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-danger-600 hover:text-danger-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredRecords.length}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-success-600">
              {filteredRecords.filter(r => r.status === 'present').length}
            </div>
            <div className="text-sm text-gray-600">Present</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-danger-600">
              {filteredRecords.filter(r => r.status === 'absent').length}
            </div>
            <div className="text-sm text-gray-600">Absent</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-warning-600">
              {filteredRecords.filter(r => r.status === 'late').length}
            </div>
            <div className="text-sm text-gray-600">Late</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance; 