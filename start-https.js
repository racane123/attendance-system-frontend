const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if SSL certificates exist
const certPath = path.join(__dirname, 'localhost.pem');
const keyPath = path.join(__dirname, 'localhost-key.pem');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.log('SSL certificates not found. Creating self-signed certificates...');
  
  // Create self-signed certificates using mkcert or openssl
  const { execSync } = require('child_process');
  
  try {
    // Try to use mkcert if available
    execSync('mkcert -install', { stdio: 'inherit' });
    execSync('mkcert localhost', { stdio: 'inherit' });
    console.log('SSL certificates created successfully using mkcert!');
  } catch (error) {
    console.log('mkcert not available, using openssl...');
    
    // Create certificates using openssl
    const opensslCommands = [
      'openssl req -x509 -newkey rsa:2048 -keyout localhost-key.pem -out localhost.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"',
      'openssl rsa -in localhost-key.pem -out localhost-key.pem'
    ];
    
    opensslCommands.forEach(cmd => {
      try {
        execSync(cmd, { stdio: 'inherit' });
      } catch (err) {
        console.error('Failed to create SSL certificate:', err.message);
        console.log('Please install mkcert or openssl to enable HTTPS for camera access.');
        console.log('For now, camera access may not work properly.');
      }
    });
  }
}

// Set environment variables for HTTPS
process.env.HTTPS = 'true';
process.env.SSL_CRT_FILE = 'localhost.pem';
process.env.SSL_KEY_FILE = 'localhost-key.pem';

console.log('Starting React app with HTTPS...');
console.log('Camera access should now work properly!');
console.log('Access your app at: https://localhost:3000');

// Start the React development server
const child = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

child.on('error', (error) => {
  console.error('Failed to start React app:', error);
});

child.on('close', (code) => {
  console.log(`React app exited with code ${code}`);
}); 