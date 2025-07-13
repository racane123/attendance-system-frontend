const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting React development server for ngrok...\n');

// Set environment variables for ngrok compatibility
process.env.DANGEROUSLY_DISABLE_HOST_CHECK = 'true';
process.env.HOST = '0.0.0.0';

console.log('✅ Environment variables set:');
console.log('   - DANGEROUSLY_DISABLE_HOST_CHECK=true');
console.log('   - HOST=0.0.0.0\n');

// Start React development server
const reactScripts = spawn('react-scripts', ['start'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
    HOST: '0.0.0.0'
  }
});

reactScripts.on('close', (code) => {
  console.log(`\n❌ React development server exited with code ${code}`);
  process.exit(code);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping React development server...');
  reactScripts.kill();
  process.exit(0);
}); 