import axios from 'axios';

// Use direct localhost:5000 URL for backend API
const getApiBaseUrl = () => {
  // If environment variable is set, use it (for production/ngrok)
  if (process.env.REACT_APP_API_URL) {
    console.log('Using API URL from environment:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Default: direct connection to backend on localhost:5000
  console.log('Using direct localhost API URL');
  return 'http://localhost:5000/api';
};

// Create axios instance with direct backend URL
const createApiInstance = () => {
  const baseURL = getApiBaseUrl();
  console.log('Creating API instance with base URL:', baseURL);
  
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

let api = createApiInstance();

// Function to update API base URL
export const updateApiBaseUrl = () => {
  api = createApiInstance();
  console.log('API base URL updated');
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    
    // Add auth token to requests
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'Present' : 'Missing');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('No token found, request will be unauthenticated');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error Details:');
    console.error('  URL:', error.config?.url);
    console.error('  Method:', error.config?.method);
    console.error('  Status:', error.response?.status);
    console.error('  Status Text:', error.response?.statusText);
    console.error('  Response Data:', error.response?.data);
    console.error('  Error Message:', error.message);
    
    // Handle authentication errors globally - but only for actual auth endpoints
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      
      if (isAuthEndpoint) {
        console.log('Authentication error on auth endpoint, clearing token');
        localStorage.removeItem('token');
        
        // Only redirect to login if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else {
        console.log('Authentication error on non-auth endpoint, letting component handle it');
      }
    }
    
    return Promise.reject(error);
  }
);

// Students API
export const studentsAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getByQR: (qrCode) => api.get(`/students/by-qr/${qrCode}`),
  getBySection: (section) => api.get(`/students/by-section/${section}`),
  getAllSections: () => api.get('/students/sections/all'),
};

// Subjects API
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Scanner API
export const scannerAPI = {
  // Session management
  startSession: (subjectId) => api.post('/scan/session/start', { subject_id: subjectId }),
  endSession: (sessionId) => api.put(`/scan/session/end/${sessionId}`),
  getActiveSessions: () => api.get('/scan/session/active'),
  getSession: (sessionId) => api.get(`/scan/session/${sessionId}`),
  
  // QR scanning
  scanQR: (qrCode, subjectId) => api.post('/scan/scan', { qr_code: qrCode, subject_id: subjectId }),
  
  // Attendance records
  getAttendance: (subjectId, date) => api.get(`/scan/attendance/${subjectId}/${date}`),
  getAttendanceSummary: (subjectId, startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return api.get(`/scan/attendance/summary/${subjectId}`, { params });
  },
  updateAttendance: (recordId, status) => api.put(`/scan/attendance/${recordId}`, { status }),
  deleteAttendance: (recordId) => api.delete(`/scan/attendance/${recordId}`),
  
  // Manual attendance management
  getStudentsForAttendance: (subjectId, date) => api.get(`/scan/students/${subjectId}`, { params: { date } }),
  recordManualAttendance: (data) => api.post('/scan/attendance/manual', data),
  updateManualAttendance: (recordId, data) => api.put(`/scan/attendance/manual/${recordId}`, data),
  
  // Utility
  getTodayOverview: () => api.get('/scan/today'),
  healthCheck: () => api.get('/scan'),
};

// Authentication API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
  getAllUsers: () => api.get('/auth/users'),
  getUserById: (userId) => api.get(`/auth/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/auth/users/${userId}`, userData),
  updateUserRole: (userId, role) => api.put(`/auth/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/auth/users/${userId}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Email API
export const emailAPI = {
  // Email management
  getHistory: (params) => api.get('/email-management/history', { params }),
  getStats: (params) => api.get('/email-management/stats', { params }),
  getPreferences: () => api.get('/email-management/preferences'),
  updatePreferences: (preferences) => api.put('/email-management/preferences', preferences),
  
  // Email sending
  sendNotification: (data) => api.post('/email/notification', data),
  sendAttendanceReport: (data) => api.post('/email/attendance-report', data),
  sendDailySummary: (data) => api.post('/email/send-daily-summary', data),
  sendWeeklySummary: (data) => api.post('/email/send-weekly-summary', data),
  testStudentAttendance: (data) => api.post('/email/test-student-attendance', data),
};

export default api; 