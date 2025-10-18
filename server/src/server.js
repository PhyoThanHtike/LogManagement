// server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import { limiter } from "./middleware/rate-limiter.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// For resolving paths when deploying
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- HTTP MIDDLEWARE ----------------
app.use(helmet());

// Add this BEFORE app.use(cors(...))
console.log('🔧 CORS Configuration:');
console.log('NODE_ENV:', NODE_ENV);
console.log('CLIENT_URL:', process.env.CLIENT_URL);

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = NODE_ENV === "production"
        ? [
            process.env.CLIENT_URL,
            'https://log-management-steel.vercel.app',
          ].filter(Boolean) // Remove undefined values
        : [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000'
          ];

      console.log('📍 Request origin:', origin);
      console.log('✅ Allowed origins:', allowedOrigins);

      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.error('❌ Origin not allowed:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    optionsSuccessStatus: 200
  })
);
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(cookieParser());
app.use(limiter);

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// ---------------- HTTP SERVER ----------------
// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Add this route AFTER your CORS middleware
app.get('/api/debug/cors', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL,
    origin: req.headers.origin,
    host: req.headers.host,
  });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${NODE_ENV} mode`);
});

// Graceful shutdown (optional but good practice)
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => process.exit(0));
});
