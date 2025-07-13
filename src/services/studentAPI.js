import apiService from './api.js';

const studentAPI = {
  // Get all students
  getAllStudents: async () => {
    try {
      const response = await apiService.get('/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // Get student by ID
  getStudentById: async (id) => {
    try {
      const response = await apiService.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  },

  // Create new student
  createStudent: async (studentData) => {
    try {
      const response = await apiService.post('/students', studentData);
      return response.data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  // Update student
  updateStudent: async (id, studentData) => {
    try {
      const response = await apiService.put(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  // Delete student
  deleteStudent: async (id) => {
    try {
      const response = await apiService.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  // Get students by section
  getStudentsBySection: async (section) => {
    try {
      const response = await apiService.get(`/students/section/${section}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students by section:', error);
      throw error;
    }
  },

  // Get all sections
  getAllSections: async () => {
    try {
      const response = await apiService.get('/students/sections');
      return response.data;
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  }
};

export default studentAPI; 