// tests/userRoutes.test.js
import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// -----------------------------
// 🧩 Step 1: Mock modules BEFORE importing any app logic
// -----------------------------

// Mock EmailService first to prevent Resend initialization errors
jest.unstable_mockModule("../src/services/emailService.js", () => ({
  EmailService: {
    sendOTPEmail: jest.fn().mockResolvedValue({ success: true }),
    sendNotificationEmail: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock protectRoute middleware to bypass auth
jest.unstable_mockModule("../src/middleware/protectRoute.js", () => ({
  protectRoute: (req, res, next) => {
    req.user = { id: 1, name: "Test User", status: "ACTIVE", isVerified: true };
    next();
  },
}));

// Mock LogService for both controllers
jest.unstable_mockModule("../src/services/logService.js", () => ({
  LogService: {
    getLogsInfinite: jest.fn(),
    getLogsSummary: jest.fn(),
  },
}));

// Mock query validation middlewares
jest.unstable_mockModule("../src/middleware/queryValidation.js", () => ({
  validateLogQueryMiddleware: (req, res, next) => next(),
  validateTenantQueryMiddleware: (req, res, next) => next(),
}));

// -----------------------------
// 🧩 Step 2: Import AFTER mocks are in place
// -----------------------------
const { LogService } = await import("../src/services/logService.js");
const userRouter = (await import("../src/routes/user.route.js")).default;

// -----------------------------
// 🧩 Step 3: Setup Express app
// -----------------------------
const app = express();
app.use(express.json());
app.use("/", userRouter);

// -----------------------------
// 🧩 Step 4: Tests
// -----------------------------
describe("✅ User Routes (get-logs, get-summary)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // GET /get-logs
  // ---------------------------------------------------------------------------
  describe("GET /get-logs", () => {
    it("should return logs successfully", async () => {
      LogService.getLogsInfinite.mockResolvedValueOnce({
        hasNextPage: true,
        nextCursor: "cursor123",
        prevCursor: null,
        logs: [
          { id: 1, message: "User logged in" },
          { id: 2, message: "User updated profile" },
        ],
      });

      const res = await request(app).get("/get-logs?limit=2");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveLength(2);
      expect(LogService.getLogsInfinite).toHaveBeenCalled();
    });

    it("should handle internal server errors gracefully", async () => {
      LogService.getLogsInfinite.mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const res = await request(app).get("/get-logs");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message", "Internal Server Error");
      expect(res.body).toHaveProperty("error", "Database connection failed");
    });
  });

  // ---------------------------------------------------------------------------
  // GET /get-summary
  // ---------------------------------------------------------------------------
  describe("GET /get-summary", () => {
    it("should return summary data", async () => {
      LogService.getLogsSummary.mockResolvedValueOnce({
        totalLogs: 120,
        critical: 5,
        warnings: 10,
      });

      const res = await request(app).get("/get-summary");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("totalLogs", 120);
      expect(LogService.getLogsSummary).toHaveBeenCalled();
    });

    it("should handle service failure gracefully", async () => {
      LogService.getLogsSummary.mockRejectedValueOnce(
        new Error("Service unavailable")
      );

      const res = await request(app).get("/get-summary");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message", "Internal Server Error");
      expect(res.body.error).toBe("Service unavailable");
    });
  });

  // ---------------------------------------------------------------------------
  // Middleware check
  // ---------------------------------------------------------------------------
  describe("Middleware Tests", () => {
    it("should attach user from mock middleware", async () => {
      const { protectRoute } = await import("../src/middleware/protectRoute.js");
      const req = {};
      const res = {};
      const next = jest.fn();
      await protectRoute(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.name).toBe("Test User");
      expect(next).toHaveBeenCalled();
    });
  });
});
