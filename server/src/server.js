// server.js
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

dotenv.config();
const PORT = process.env.PORT || 3000;

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
const server = app.listen(PORT, () => {
  console.log(`✅ HTTP server running on port ${PORT}`);
});

// graceful shutdown (optional)
process.on('SIGINT', () => {
  console.log('Shutting down HTTP server...');
  server.close(() => process.exit(0));
});

