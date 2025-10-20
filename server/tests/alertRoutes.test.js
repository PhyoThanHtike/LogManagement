import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// -----------------------------
// 🧩 Step 1: Mock all dependencies BEFORE imports
// -----------------------------

// Mock EmailService first to prevent Resend initialization errors
jest.unstable_mockModule("../src/services/emailService.js", () => ({
  EmailService: {
    sendOTPEmail: jest.fn().mockResolvedValue({ success: true }),
    sendNotificationEmail: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock protectRoute middleware (bypass authentication)
jest.unstable_mockModule("../src/middleware/protectRoute.js", () => ({
  protectRoute: (req, res, next) => {
    req.user = { id: 1, name: "Test User", status: "ACTIVE", isVerified: true };
    next();
  },
}));

// Mock AlertService (used in controller)
jest.unstable_mockModule("../src/services/alertService.js", () => ({
  AlertService: {
    getRecentAlerts: jest.fn(),
  },
}));

// Mock query validation middleware
jest.unstable_mockModule("../src/middleware/queryValidation.js", () => ({
  validateTenantQueryMiddleware: (req, res, next) => next(),
  validateLogQueryMiddleware: (req, res, next) => next(),
}));


// -----------------------------
// 🧩 Step 2: Import AFTER mocks
// -----------------------------
const { AlertService } = await import("../src/services/alertService.js");
const userRouter = (await import("../src/routes/user.route.js")).default;

// -----------------------------
// 🧩 Step 3: Setup test app
// -----------------------------
const app = express();
app.use(express.json());
app.use("/", userRouter);

// -----------------------------
// 🧩 Step 4: Tests
// -----------------------------
describe("✅ Recent Alerts Route Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // GET /recent-alerts - success
  // ---------------------------------------------------------------------------
  it("should return recent alerts successfully", async () => {
    AlertService.getRecentAlerts.mockResolvedValueOnce([
      { id: 1, type: "ERROR", message: "Disk space low" },
      { id: 2, type: "WARNING", message: "CPU usage high" },
    ]);

    const res = await request(app).get("/recent-alerts");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.count).toBe(2);
    expect(AlertService.getRecentAlerts).toHaveBeenCalledWith({}, 5);
  });

  // ---------------------------------------------------------------------------
  // GET /recent-alerts - with tenant filter
  // ---------------------------------------------------------------------------
  it("should handle tenant filter correctly", async () => {
    AlertService.getRecentAlerts.mockResolvedValueOnce([
      { id: 1, type: "INFO", message: "Tenant-specific alert" },
    ]);

    const res = await request(app).get("/recent-alerts?tenant=AcmeCorp");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(AlertService.getRecentAlerts).toHaveBeenCalledWith(
      { tenant: "AcmeCorp" },
      5
    );
  });

  // ---------------------------------------------------------------------------
  // GET /recent-alerts - internal server error
  // ---------------------------------------------------------------------------
  it("should handle internal server errors gracefully", async () => {
    AlertService.getRecentAlerts.mockRejectedValueOnce(new Error("Database down"));

    const res = await request(app).get("/recent-alerts");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Internal Server Error");
  });
});
