// syslog.js
// import dotenv from 'dotenv';
// import dgram from 'dgram';
// import fs from 'fs';
// import path from 'path';

// dotenv.config();
// const SYSLOG_PORT = Number(process.env.SYSLOG_PORT) || 514;

// const syslogServer = dgram.createSocket('udp4');

// // Ensure logs directory exists
// const logsDir = path.resolve('./logs');
// if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// syslogServer.on('message', (msg, rinfo) => {
//   const message = msg.toString().trim();
//   console.log(`📥 Syslog from ${rinfo.address}:${rinfo.port}`);
//   console.log(message);

//   const logLine = `[${new Date().toISOString()}] ${rinfo.address}:${rinfo.port} ${message}\n`;
//   const filePath = path.join(logsDir, 'syslog.log');

//   // append async to avoid blocking
//   fs.appendFile(filePath, logLine, 'utf8', (err) => {
//     if (err) console.error('Failed to write syslog:', err);
//   });
// });

// syslogServer.on('listening', () => {
//   const address = syslogServer.address();
//   console.log(`✅ Syslog server listening on ${address.address}:${address.port}`);
// });

// syslogServer.on('error', (err) => {
//   console.error('❌ Syslog server error:', err);
//   syslogServer.close();
// });

// // Bind
// syslogServer.bind(SYSLOG_PORT, '0.0.0.0');

// // graceful shutdown
// process.on('SIGINT', () => {
//   console.log('Shutting down syslog server...');
//   syslogServer.close(() => process.exit(0));
// });

// src/syslog.js
import dotenv from "dotenv";
import dgram from "dgram";
import fs from "fs";
import path from "path";
import { normalizeData } from "./utils/normalizeService.js";
import { LogService } from "./services/logService.js";
import { AlertService } from "./services/alertService.js";
import { EmailService } from "./services/emailService.js";
import prisma from "./utils/database.js";

dotenv.config();
const SYSLOG_PORT = Number(process.env.SYSLOG_PORT) || 5514; // use >=1024 for dev
const MAX_MESSAGE_LENGTH = 16_384; // guard: drop/trim overly large messages

const syslogServer = dgram.createSocket("udp4");
const logsDir = path.resolve("./logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// Helper fallback writer (async)
async function fallbackWriteLogFile(logLine) {
  try {
    await fs.promises.appendFile(path.join(logsDir, "syslog_fallback.log"), logLine, "utf8");
  } catch (err) {
    console.error("Failed to write fallback log file:", err);
  }
}

// Handle an incoming syslog message (delegated task)
async function handleSyslogMessage(rawMessage, rinfo) {
  const receivedAt = new Date().toISOString();
  try {
    // sanitize / limit size
    let message = String(rawMessage).trim();
    if (message.length > MAX_MESSAGE_LENGTH) {
      message = message.slice(0, MAX_MESSAGE_LENGTH) + " [TRUNCATED]";
    }

    console.log(`📥 Syslog from ${rinfo.address}:${rinfo.port} — ${message}`);

    // Example tenant/source resolution — replace with real logic
    const tenant = "TENANT1";
    const source = "FIREWALL";

    // Normalize
    const normalizedLog = normalizeData(tenant, source, message, {
      receivedAt,
      remoteAddress: rinfo.address,
      remotePort: rinfo.port,
    });

    // Persist to DB (assumes LogService.createLog returns a Promise)
    let logRecord;
    try {
      logRecord = await LogService.createLog(normalizedLog);
    } catch (dbErr) {
      console.error("DB write failed, falling back to file:", dbErr);
      const fallbackLine = `[${receivedAt}] ${rinfo.address}:${rinfo.port} ${message}\n`;
      // write fallback and continue (we cannot drop logs silently)
      await fallbackWriteLogFile(fallbackLine);
      // still attempt to run alert logic with normalizedLog (no DB id)
      logRecord = { ...normalizedLog, id: null }; // minimal shape
    }

    // Check alert rules (assumes async). Pass logRecord which may or may not have DB id.
    let alerts = [];
    try {
      alerts = await AlertService.checkAlertRules(logRecord);
    } catch (alertErr) {
      console.error("Alert rule evaluation failed:", alertErr);
    }

    // If alerts were created, notify admins
    if (Array.isArray(alerts) && alerts.length > 0) {
      try {
        const adminUsers = await prisma.user.findMany({
          where: {
            role: "ADMIN",
            status: "ACTIVE",
            isVerified: true,
          },
          select: { email: true },
        });

        const adminEmails = adminUsers.map((u) => u.email).filter(Boolean);
        if (adminEmails.length > 0) {
          // send emails in parallel, but catch per-email errors
          await Promise.all(
            alerts.map((alert) =>
              EmailService.sendAlertEmail(adminEmails, alert, logRecord).catch((err) => {
                console.error("Failed to send alert email for alert:", alert, err);
              })
            )
          );
        } else {
          console.warn("No admin emails found to notify for alerts.");
        }
      } catch (emailErr) {
        console.error("Failed to fetch admin emails or send notifications:", emailErr);
      }
    }
  } catch (err) {
    // Top-level protection for unexpected errors in processing
    console.error("Unexpected error processing syslog message:", err);
    const fallbackLine = `[${new Date().toISOString()}] ${rinfo.address}:${rinfo.port} ERROR ${String(err)}\n`;
    await fallbackWriteLogFile(fallbackLine);
  }
}

// UDP message handler — starts an async task but returns immediately
syslogServer.on("message", (msg, rinfo) => {
  // Kick off async processing but do not await here (keeps UDP handler fast).
  // `void` silences the linter about unhandled promise.
  void handleSyslogMessage(msg.toString(), rinfo);
});

syslogServer.on("listening", () => {
  const address = syslogServer.address();
  console.log(`✅ Syslog server listening on ${address.address}:${address.port}`);
});

syslogServer.on("error", (err) => {
  console.error("❌ Syslog server error:", err);
  syslogServer.close();
});

syslogServer.bind(SYSLOG_PORT, "0.0.0.0");

// graceful shutdown
function shutdown() {
  console.log("Shutting down syslog server...");
  syslogServer.close(() => {
    // Optionally close DB connection if needed:
    if (prisma && typeof prisma.$disconnect === "function") {
      prisma.$disconnect().finally(() => process.exit(0));
    } else {
      process.exit(0);
    }
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

