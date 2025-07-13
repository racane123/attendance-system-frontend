import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { subjectsAPI } from '../services/api';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectsAPI.getAll();
      console.log('Subjects response:', response);
      // Handle both response structures
      const subjectsData = response.data?.data || response.data || [];
      console.log('Subjects data extracted:', subjectsData);
      if (Array.isArray(subjectsData)) {
        setSubjects(subjectsData);
      } else {
        console.error('Invalid subjects data:', subjectsData);
        setSubjects([]);
        toast.error('Invalid data received from server');
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      setSubjects([]);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSubject) {
        await subjectsAPI.update(editingSubject.id, formData);
        toast.success('Subject updated successfully!');
      } else {
        await subjectsAPI.create(formData);
        toast.success('Subject created successfully!');
      }
      
      setShowModal(false);
      setEditingSubject(null);
      resetForm();
      loadSubjects();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save subject');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectsAPI.delete(id);
        toast.success('Subject deleted successfully!');
        loadSubjects();
      } catch (error) {
        toast.error('Failed to delete subject');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: ''
    });
  };

  const filteredSubjects = subjects.filter(subject => {
    const searchLower = searchTerm.toLowerCase();
    return subject.name.toLowerCase().includes(searchLower) || 
           subject.code.toLowerCase().includes(searchLower) ||
           (subject.description && subject.description.toLowerCase().includes(searchLower));
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
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <p className="mt-2 text-gray-600">Manage course subjects and descriptions</p>
        </div>
        <button
          onClick={() => {
            setEditingSubject(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary"
        >
          Add Subject
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Subjects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <div key={subject.id} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                <p className="text-sm text-primary-600 font-medium">{subject.code}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(subject)}
                  className="text-primary-600 hover:text-primary-900"
                  title="Edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="text-danger-600 hover:text-danger-900"
                  title="Delete"
                >
                  Delete
                </button>
              </div>
            </div>
            {subject.description && (
              <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
            )}
            <div className="text-xs text-gray-500">
              Created: {new Date(subject.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Subject Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Subject Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input"
                    rows="3"
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary flex-1">
                    {editingSubject ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSubject(null);
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
    </div>
  );
};

export default Subjects; 