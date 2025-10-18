import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting combined servers...');

const isProduction = process.env.NODE_ENV === 'production';

// Start HTTP server
const httpServer = spawn('node', [path.join(__dirname, 'server.js')], {
  stdio: 'inherit',
  env: { ...process.env }
});

// Start Syslog server (only in development - UDP not supported on Render)
let syslogServer = null;
if (!isProduction) {
  console.log('🔵 Starting Syslog server (development only)...');
  syslogServer = spawn('node', [path.join(__dirname, 'syslog.js')], {
    stdio: 'inherit',
    env: { ...process.env }
  });
} else {
  console.log('⚠️  Syslog server skipped in production (UDP not supported on PaaS)');
}

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