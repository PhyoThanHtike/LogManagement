import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// 🧩 Step 1: Mock BEFORE importing app modules

// Mock EmailService first to prevent Resend initialization errors
jest.unstable_mockModule("../src/services/emailService.js", () => ({
  EmailService: {
    sendOTPEmail: jest.fn().mockResolvedValue({ success: true }),
    sendNotificationEmail: jest.fn().mockResolvedValue({ success: true }),
    // Add any other methods your app uses
  }
}));

jest.unstable_mockModule("../src/middleware/protectRoute.js", () => ({
  protectRoute: (req, res, next) => {
    req.user = { id: 1, name: "Test User", status: "ACTIVE", isVerified: true };
    next(); // bypass auth
  },
}));

jest.unstable_mockModule("../src/services/logService.js", () => ({
  LogService: {
    getLogsInfinite: jest.fn().mockResolvedValue({
      hasNextPage: true,
      nextCursor: "cursor123",
      prevCursor: null,
      logs: [
        { id: 1, message: "User logged in" },
        { id: 2, message: "User updated profile" },
      ],
    }),
    getLogsSummary: jest.fn().mockResolvedValue({
      totalLogs: 120,
      critical: 5,
      warnings: 10,
    }),
  },
}));

// 🧩 Step 2: Import AFTER mocks are registered
const { LogService } = await import("../src/services/logService.js");
const { protectRoute } = await import("../src/middleware/protectRoute.js");
const userRouter = (await import("../src/routes/user.route.js")).default;

// 🧩 Step 3: Setup test app
const app = express();
app.use(express.json());
app.use("/", userRouter);

describe("✅ User Routes Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // GET /get-logs
  // ---------------------------------------------------------------------------
  describe("GET /get-logs", () => {
    it("should return logs successfully", async () => {
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
  // Middleware
  // ---------------------------------------------------------------------------
  describe("Middleware Tests", () => {
    it("should attach user from mock middleware", async () => {
      const mockReq = {};
      const mockRes = {};
      const next = jest.fn();
      await protectRoute(mockReq, mockRes, next);
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.name).toBe("Test User");
      expect(next).toHaveBeenCalled();
    });
  });
});