// Test script to verify email integration
console.log('🧪 Testing Email Integration...');

// Test API URL configuration
import { getCurrentApiUrl } from './utils/apiUtils';

const testEmailIntegration = () => {
  console.log('📡 Current API URL:', getCurrentApiUrl());
  
  // Test if all components can be imported
  try {
    console.log('✅ Testing component imports...');
    
    // Test email components
    require('./components/EmailHistory');
    require('./components/EmailStats');
    require('./components/SendEmailForm');
    require('./components/EmailPreferences');
    require('./components/EmailNotification');
    require('./pages/EmailManagement');
    
    console.log('✅ All email components imported successfully');
  } catch (error) {
    console.error('❌ Component import error:', error.message);
  }

  // Test API endpoints
  const testEndpoints = async () => {
    const baseUrl = getCurrentApiUrl();
    const endpoints = [
      '/email-management/history',
      '/email-management/stats',
      '/email-management/preferences',
      '/email/notification',
      '/email/attendance-report',
      '/email/send-daily-summary',
      '/email/send-weekly-summary'
    ];

    console.log('🔍 Testing API endpoints...');
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 401) {
          console.log(`✅ ${endpoint}: Requires authentication`);
        } else if (response.status === 404) {
          console.log(`❌ ${endpoint}: Not found`);
        } else {
          console.log(`✅ ${endpoint}: Status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: Error - ${error.message}`);
      }
    }
  };

  // Run endpoint tests if we're in a browser environment
  if (typeof window !== 'undefined') {
    testEndpoints();
  }

  console.log('🎉 Email integration testing complete!');
};

export default testEmailIntegration; 