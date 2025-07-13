import apiService from './api.js';

const subjectAPI = {
  // Get all subjects
  getAllSubjects: async () => {
    try {
      const response = await apiService.get('/subjects');
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },

  // Get subject by ID
  getSubjectById: async (id) => {
    try {
      const response = await apiService.get(`/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject:', error);
      throw error;
    }
  },

  // Create new subject
  createSubject: async (subjectData) => {
    try {
      const response = await apiService.post('/subjects', subjectData);
      return response.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  },

  // Update subject
  updateSubject: async (id, subjectData) => {
    try {
      const response = await apiService.put(`/subjects/${id}`, subjectData);
      return response.data;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  // Delete subject
  deleteSubject: async (id) => {
    try {
      const response = await apiService.delete(`/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }
};

export default subjectAPI; 