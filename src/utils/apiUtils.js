// Utility functions for API configuration

export const clearApiCache = () => {
  // Clear any cached backend URLs
  localStorage.removeItem('backendApiUrl');
  console.log('API cache cleared');
};

export const getCurrentApiUrl = () => {
  // Get the current API URL being used
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  const savedUrl = localStorage.getItem('backendApiUrl');
  if (savedUrl) {
    return savedUrl;
  }
  
  if (window.location.hostname.includes('ngrok')) {
    const currentUrl = window.location.origin;
    const backendUrl = currentUrl.replace(':3000', ':5000');
    return `${backendUrl}/api`;
  }
  
  return 'http://localhost:5000/api';
};

export const setBackendUrl = (url) => {
  // Ensure URL ends with /api
  let finalUrl = url.trim();
  if (!finalUrl.endsWith('/api')) {
    finalUrl = finalUrl.endsWith('/') ? finalUrl + 'api' : finalUrl + '/api';
  }
  
  localStorage.setItem('backendApiUrl', finalUrl);
  console.log('Backend URL set to:', finalUrl);
  return finalUrl;
};

export const resetToDefault = () => {
  localStorage.removeItem('backendApiUrl');
  console.log('Reset to default API configuration');
}; 