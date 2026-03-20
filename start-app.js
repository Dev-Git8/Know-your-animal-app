const { spawn } = require('child_process');
const path = require('path');

console.log("🚀 Starting Know Your Animal App...");

// Start Backend
console.log("📂 Starting Backend (Flask on Port 3000)...");
const backend = spawn('python', ['app.py'], {
  cwd: __dirname,
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
