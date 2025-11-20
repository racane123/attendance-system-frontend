import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, Search, Eye, Download, Edit } from 'lucide-react';
import { studentsAPI } from '../services/api';
import QRCode from 'qrcode';
import JSZip from 'jszip';

// Utility to sanitize filenames
function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9\-_.]/gi, '_');
}

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [sections, setSections] = useState([]);
  const [showQR, setShowQR] = useState(null);

  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    section: ''
  });

  useEffect(() => {
    loadStudents();
    loadSections();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAll();
      console.log('Students response:', response);
      // Handle both response structures
      const studentsData = response.data?.data || response.data || [];
      console.log('Students data extracted:', studentsData);
      if (Array.isArray(studentsData)) {
        setStudents(studentsData);
      } else {
        console.error('Invalid students data:', studentsData);
        setStudents([]);
        toast.error('Invalid data received from server');
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => {
    try {
      const response = await studentsAPI.getAllSections();
      console.log('Sections response:', response);
      
      // Handle different response structures
      const sectionsData = response.data || [];
      console.log('Sections data extracted:', sectionsData);
      
      if (Array.isArray(sectionsData)) {
        setSections(sectionsData);
      } else {
        console.error('Invalid sections data:', sectionsData);
        setSections(['GK3DA', 'GP3DA', 'GT3DA','GU3DA', 'GK3DB', 'GC3DA','GU3DB', 'GP1MA']); // Fallback sections
      }
    } catch (error) {
      console.error('Error loading sections:', error);
      setSections(['GK3DA', 'GP3DA', 'GT3DA','GU3DA', 'GK3DB', 'GC3DA','GU3DB','GP1MA']);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingStudent) {
        await studentsAPI.update(editingStudent.id, formData);
        toast.success('Student updated successfully!');
      } else {
        await studentsAPI.create(formData);
        toast.success('Student created successfully!');
      }
      
      setShowModal(false);
      setEditingStudent(null);
      resetForm();
      loadStudents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save student');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      first_name: student.first_name,
      middle_name: student.middle_name || '',
      last_name: student.last_name,
      email: student.email,
      section: student.section
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsAPI.delete(id);
        toast.success('Student deleted successfully!');
        loadStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleShowQR = async (qrCode) => {
    try {
      const qrDataURL = await QRCode.toDataURL(qrCode);
      setShowQR(qrDataURL);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQR = async (qrCode, student) => {
    try {
      const qrDataURL = await QRCode.toDataURL(qrCode);
      const fullName = [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(' ');
      const safeName = sanitizeFilename(fullName);
      const link = document.createElement('a');
      link.download = `qr-${safeName}.png`;
      link.href = qrDataURL;
      link.click();
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const bulkDownloadQR = async () => {
    const zip = new JSZip();
    const studentsToDownload = filteredStudents.filter(s => !selectedSection || s.section === selectedSection);
    for (const student of studentsToDownload) {
      if (!student.qr_code) continue;
      const fullName = [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(' ');
      const safeName = sanitizeFilename(fullName);
      try {
        const qrDataURL = await QRCode.toDataURL(student.qr_code);
        // Convert dataURL to blob
        const res = await fetch(qrDataURL);
        const blob = await res.blob();
        zip.file(`qr-${safeName}.png`, blob);
      } catch (e) {
        // Optionally handle error per student
      }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const sectionName = selectedSection ? `section-${sanitizeFilename(selectedSection)}` : 'all-sections';
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `qr-codes-${sectionName}.zip`;
    link.click();
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      section: sections[0] || ''
    });
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(searchLower) || 
                         student.student_id.toLowerCase().includes(searchLower) ||
                         student.email.toLowerCase().includes(searchLower);
    
    const matchesSection = !selectedSection || student.section === selectedSection;
    
    return matchesSearch && matchesSection;
  });

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="mt-2 text-gray-600">Manage student information and QR codes</p>
        </div>
        <button
          onClick={() => {
            setEditingStudent(null);
            setFormData({
              student_id: '',
              first_name: '',
              middle_name: '',
              last_name: '',
              email: '',
              section: sections[0] || ''
            });
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="relative">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="input pl-10"
            >
              <option value="">All Sections</option>
              {Array.isArray(sections) && sections.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Download Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={bulkDownloadQR}
          className="btn-secondary flex items-center"
          disabled={filteredStudents.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Bulk Download QR Codes {selectedSection && `(Section ${selectedSection})`}
        </button>
      </div>

      {/* Students List */}
      <div className="card">
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
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QR Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.student_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleShowQR(student.qr_code)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View QR Code"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => downloadQR(student.qr_code, student)}
                        className="text-success-600 hover:text-success-900"
                        title="Download QR Code"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-danger-600 hover:text-danger-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Student ID</label>
                  <input
                    type="text"
                    value={formData.student_id}
                    onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Middle Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    className="input"
                    required
                  >
                    {Array.isArray(sections) && sections.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary flex-1">
                    {editingStudent ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingStudent(null);
                      resetForm();
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-80 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">QR Code</h3>
              <img src={showQR} alt="QR Code" className="mx-auto mb-4" />
              <button
                onClick={() => setShowQR(null)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students; 