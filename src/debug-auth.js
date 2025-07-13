// Debug script for authentication
import { authAPI } from './services/api';

export const debugAuth = async () => {
  console.log('=== AUTH DEBUG START ===');
  
  try {
    // Test login
    console.log('Testing login...');
    const loginResponse = await authAPI.login('admin', 'admin123');
    console.log('Login response:', loginResponse);
    
    // Test profile
    console.log('Testing profile...');
    const profileResponse = await authAPI.getProfile();
    console.log('Profile response:', profileResponse);
    
  } catch (error) {
    console.error('Auth debug error:', error);
  }
  
  console.log('=== AUTH DEBUG END ===');
}; 