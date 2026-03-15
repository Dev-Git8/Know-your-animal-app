const { spawn } = require('child_process');
const path = require('path');

console.log("🚀 Starting Know Your Animal App...");

// Start Backend
console.log("📂 Starting Backend (Port 3000)...");
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Start Frontend
console.log("📂 Starting Frontend...");
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
