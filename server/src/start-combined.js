import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting combined HTTP + Syslog + OTP Worker servers...');

// Start HTTP server
const httpServer = spawn('node', [path.join(__dirname, 'server.js')], {
  stdio: 'inherit',
  env: { ...process.env }
});

// Start Syslog server
const syslogServer = spawn('node', [path.join(__dirname, 'syslog.js')], {
  stdio: 'inherit',
  env: { ...process.env }
});

// Start OTP Worker
const otpWorker = spawn('node', [path.join(__dirname, 'jobs/worker/otpWorker.js')], {
  stdio: 'inherit',
  env: { ...process.env }
});

// Handle process exits
httpServer.on('exit', (code) => {
  console.error(`HTTP server exited with code ${code}`);
  process.exit(code);
});

syslogServer.on('exit', (code) => {
  console.error(`Syslog server exited with code ${code}`);
  process.exit(code);
});

otpWorker.on('exit', (code) => {
  console.error(`OTP Worker exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.kill('SIGTERM');
  syslogServer.kill('SIGTERM');
  otpWorker.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  httpServer.kill('SIGINT');
  syslogServer.kill('SIGINT');
  otpWorker.kill('SIGINT');
});