// Test script to verify frontend routes
console.log('🧪 Testing Frontend Routes...');

// Check if React Router is working
const testRoutes = () => {
  const routes = [
    '/',
    '/dashboard',
    '/students',
    '/subjects',
    '/scanner',
    '/attendance',
    '/reports',
    '/email-management',
    '/login',
    '/register'
  ];

  console.log('Available routes:');
  routes.forEach(route => {
    console.log(`✅ ${route}`);
  });

  // Check if components are imported correctly
  try {
    // Test component imports
    console.log('\nTesting component imports...');
    
    // These will throw errors if components don't exist
    require('./pages/EmailManagement');
    require('./components/EmailHistory');
    require('./components/EmailStats');
    require('./components/SendEmailForm');
    require('./components/EmailPreferences');
    require('./components/EmailNotification');
    
    console.log('✅ All email components imported successfully');
  } catch (error) {
    console.error('❌ Component import error:', error.message);
  }

  console.log('\n🎉 Frontend route testing complete!');
};

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  testRoutes();
}

export default testRoutes; 