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

app.use(
  cors({
    origin:
      NODE_ENV === "production"
        ? [
            process.env.CLIENT_URL, // Your Vercel frontend
            /\.vercel\.app$/, // Allow all Vercel preview deployments
          ]
        : ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
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

// // ---------------- STATIC FRONTEND ----------------
// if (NODE_ENV === "production") {
//   const clientPath = path.join(__dirname, "client", "dist"); // adjust if needed
//   app.use(express.static(clientPath));

//   app.get("*", (_, res) => {
//     res.sendFile(path.join(clientPath, "index.html"));
//   });
// }

// ---------------- HTTP SERVER ----------------
// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${NODE_ENV} mode`);
});

// Graceful shutdown (optional but good practice)
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => process.exit(0));
});
