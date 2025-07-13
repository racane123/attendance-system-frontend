import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader, 
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { scannerAPI } from '../services/api';

const ManualAttendance = ({ subjectId, subjectName, onAttendanceUpdate }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState({});

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await scannerAPI.getStudentsForAttendance(subjectId, selectedDate);
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [subjectId, selectedDate]);

  useEffect(() => {
    console.log('ManualAttendance useEffect triggered:', { subjectId, selectedDate });
    if (subjectId && selectedDate) {
      console.log('Loading students for subject:', subjectId, 'date:', selectedDate);
      loadStudents();
    } else {
      console.log('Missing required props:', { subjectId, selectedDate });
    }
  }, [subjectId, selectedDate, loadStudents]);

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [studentId]: true }));
      
      const student = students.find(s => s.id === studentId);
      
      if (student.attendance_id) {
        // Update existing attendance
        const response = await scannerAPI.updateManualAttendance(student.attendance_id, {
          status: newStatus,
          time_in: new Date().toISOString()
        });
        
        if (response.data.success) {
          setStudents(students.map(s => 
            s.id === studentId 
              ? { ...s, status: newStatus, attendance_id: response.data.data.id, is_default_absent: false }
              : s
          ));
          toast.success(`Marked ${student.full_name} as ${newStatus}`);
        }
      } else {
        // Create new attendance record
        const response = await scannerAPI.recordManualAttendance({
          student_id: studentId,
          subject_id: subjectId,
          date: selectedDate,
          status: newStatus,
          time_in: new Date().toISOString()
        });
        
        if (response.data.success) {
          setStudents(students.map(s => 
            s.id === studentId 
              ? { ...s, status: newStatus, attendance_id: response.data.data.id, is_default_absent: false }
              : s
          ));
          toast.success(`Marked ${student.full_name} as ${newStatus}`);
        }
      }
      
      // Notify parent component
      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error(error.response?.data?.error || 'Failed to update attendance');
    } finally {
      setUpdating(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />;
      case 'absent': return <XCircle className="h-4 w-4" />;
      case 'late': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0, late: 0, unmarked: 0 };
    students.forEach(student => {
      if (student.status) {
        counts[student.status]++;
      } else {
        counts.unmarked++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary-600" />
            Manual Attendance
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {subjectName} - {new Date(selectedDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">Present</p>
              <p className="text-lg font-bold text-green-900">{statusCounts.present}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-red-800">Absent</p>
              <p className="text-lg font-bold text-red-900">{statusCounts.absent}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Late</p>
              <p className="text-lg font-bold text-yellow-900">{statusCounts.late}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-800">Unmarked</p>
              <p className="text-lg font-bold text-gray-900">{statusCounts.unmarked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="">Unmarked</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                student.is_default_absent ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium text-gray-900">{student.full_name}</p>
                    <p className="text-sm text-gray-500">ID: {student.student_id}</p>
                    {student.section && (
                      <p className="text-sm text-gray-500">Section: {student.section}</p>
                    )}
                  </div>
                  {student.status && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                      {getStatusIcon(student.status)}
                      <span className="ml-1 capitalize">{student.status}</span>
                      {student.is_default_absent && (
                        <span className="ml-1 text-xs text-orange-600">(Default)</span>
                      )}
                    </span>
                  )}
                </div>
                {student.time_in && (
                  <p className="text-xs text-gray-400 mt-1">
                    Time: {new Date(student.time_in).toLocaleTimeString()}
                  </p>
                )}
                {student.is_default_absent && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ No QR scan recorded - marked as absent by default
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStatusChange(student.id, 'present')}
                  disabled={updating[student.id]}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    student.status === 'present'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-50 hover:border-green-300'
                  } ${updating[student.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {updating[student.id] ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    'Present'
                  )}
                </button>
                
                <button
                  onClick={() => handleStatusChange(student.id, 'late')}
                  disabled={updating[student.id]}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    student.status === 'late'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-yellow-50 hover:border-yellow-300'
                  } ${updating[student.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {updating[student.id] ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    'Late'
                  )}
                </button>
                
                <button
                  onClick={() => handleStatusChange(student.id, 'absent')}
                  disabled={updating[student.id]}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    student.status === 'absent'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-50 hover:border-red-300'
                  } ${updating[student.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {updating[student.id] ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    'Absent'
                  )}
                </button>
              </div>
            </div>
          ))}
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No students are enrolled in this subject.'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManualAttendance; 