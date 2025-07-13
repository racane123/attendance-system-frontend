import apiService from './api.js';

const enrollmentAPI = {
  // Get all enrollments
  getAllEnrollments: async () => {
    try {
      const response = await apiService.get('/enrollments');
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  },

  // Get enrollments by student
  getStudentEnrollments: async (studentId) => {
    try {
      const response = await apiService.get(`/enrollments/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student enrollments:', error);
      throw error;
    }
  },

  // Get enrollments by subject
  getSubjectEnrollments: async (subjectId) => {
    try {
      const response = await apiService.get(`/enrollments/subject/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject enrollments:', error);
      throw error;
    }
  },

  // Enroll a student in a subject
  enrollStudent: async (studentId, subjectId) => {
    try {
      const response = await apiService.post('/enrollments', {
        student_id: studentId,
        subject_id: subjectId
      });
      return response.data;
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  },

  // Update enrollment status
  updateEnrollment: async (enrollmentId, isActive) => {
    try {
      const response = await apiService.patch(`/enrollments/${enrollmentId}`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('Error updating enrollment:', error);
      throw error;
    }
  },

  // Delete enrollment (admin only)
  deleteEnrollment: async (enrollmentId) => {
    try {
      const response = await apiService.delete(`/enrollments/${enrollmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      throw error;
    }
  },

  // Bulk enroll students in a subject
  bulkEnrollStudents: async (subjectId, studentIds) => {
    try {
      const response = await apiService.post('/enrollments/bulk', {
        subject_id: subjectId,
        student_ids: studentIds
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk enrolling students:', error);
      throw error;
    }
  }
};

export default enrollmentAPI; 