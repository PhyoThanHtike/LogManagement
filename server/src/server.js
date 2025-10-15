import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import adminRoutes from './routes/admin.route.js';
import userRoutes from './routes/user.route.js';
import { limiter } from './middleware/rate-limiter.js';
import cookieParser from "cookie-parser";
import dgram from 'dgram'; // 👈 for UDP syslog server
import fs from 'fs';
import path from 'path';

dotenv.config();
const PORT = process.env.PORT || 3000;
const SYSLOG_PORT = process.env.SYSLOG_PORT || 514;

const app = express();

// ---------------- HTTP MIDDLEWARE ----------------
app.use(helmet());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'))
   .use(express.json())
   .use(limiter)
   .use(cookieParser());

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// ---------------- HTTP SERVER ----------------
app.listen(PORT, () => {
  console.log(`✅ HTTP server running on port ${PORT}`);
});

// ==========================================================
// 🛰️  SYSLOG UDP SERVER
// ==========================================================
const syslogServer = dgram.createSocket('udp4');

// Ensure logs directory exists
const logsDir = './logs';
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

// Listen for syslog messages
syslogServer.on('message', (msg, rinfo) => {
  const message = msg.toString().trim();
  console.log(`📥 Syslog from ${rinfo.address}:${rinfo.port}`);
  console.log(message);

  // Save to file (you can replace this with DB storage later)
  const logLine = `[${new Date().toISOString()}] ${rinfo.address}: ${message}\n`;
  fs.appendFileSync(path.join(logsDir, 'syslog.log'), logLine, 'utf8');
});

syslogServer.on('listening', () => {
  const address = syslogServer.address();
  console.log(`✅ Syslog server listening on ${address.address}:${address.port}`);
});

syslogServer.on('error', (err) => {
  console.error('❌ Syslog server error:', err);
});

syslogServer.bind(SYSLOG_PORT, '0.0.0.0');
