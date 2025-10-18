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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ---------------- CORS LOGGING ----------------
console.log('🔧 CORS Configuration:');
console.log('NODE_ENV:', NODE_ENV);
console.log('CLIENT_URL:', process.env.CLIENT_URL);

// ---------------- HTTP MIDDLEWARE ----------------
app.use(helmet());
// If running behind a proxy (Heroku/Render/Vercel/NGINX), enable trust proxy
if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = NODE_ENV === "production"
        ? [
            process.env.CLIENT_URL,
            'https://log-management-steel.vercel.app',
          ].filter(Boolean)
        : [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000'
          ];

      // console.log('📍 Request origin:', origin);
      // console.log('✅ Allowed origins:', allowedOrigins);

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

// ---------------- HEALTH CHECK (BEFORE ROUTES) ----------------
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    env: NODE_ENV
  });
});

// ---------------- DEBUG ENDPOINT ----------------
app.get('/api/debug/cors', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL,
    origin: req.headers.origin,
    host: req.headers.host,
  });
});

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// ---------------- 404 HANDLER ----------------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---------------- HTTP SERVER ----------------
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${NODE_ENV} mode`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  console.log("Shutting down server...");
  server.close(() => process.exit(0));
});