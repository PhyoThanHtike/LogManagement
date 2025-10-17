import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// -----------------------------
// Step 1: Mock modules BEFORE importing router
// -----------------------------
jest.unstable_mockModule("../src/middleware/protectRoute.js", () => ({
  protectRoute: (req, res, next) => {
    // Mock authenticated user
    req.user = { id: 1, name: "Test User", status: "ACTIVE", isVerified: true };
    next();
  },
}));

jest.unstable_mockModule("../src/services/alertService.js", () => ({
  AlertService: {
    getRecentAlerts: jest.fn(),
  },
}));

// -----------------------------
// Step 2: Import AFTER mocks
// -----------------------------
const { protectRoute } = await import("../src/middleware/protectRoute.js");
const { AlertService } = await import("../src/services/alertService.js");
const userRouter = (await import("../src/routes/user.route.js")).default;

// -----------------------------
// Step 3: Setup test Express app
// -----------------------------
const app = express();
app.use(express.json());
app.use("/", userRouter);

// -----------------------------
// Step 4: Tests
// -----------------------------
describe("✅ Recent Alerts Route Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return recent alerts successfully", async () => {
    AlertService.getRecentAlerts.mockResolvedValueOnce([
      { id: 1, type: "ERROR", message: "Disk space low" },
      { id: 2, type: "WARNING", message: "CPU usage high" },
    ]);

    const res = await request(app).get("/recent-alerts");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body).toHaveProperty("count", 2);
    expect(AlertService.getRecentAlerts).toHaveBeenCalledWith({}, 5);
  });

  it("should handle filters correctly", async () => {
    AlertService.getRecentAlerts.mockResolvedValueOnce([
      { id: 1, type: "INFO", message: "Tenant-specific alert" },
    ]);

    const res = await request(app).get("/recent-alerts?tenant=AcmeCorp");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(AlertService.getRecentAlerts).toHaveBeenCalledWith({ tenant: "AcmeCorp" }, 5);
  });

  it("should handle internal server errors gracefully", async () => {
    AlertService.getRecentAlerts.mockRejectedValueOnce(new Error("Database down"));

    const res = await request(app).get("/recent-alerts");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("message", "Internal Server Error"); // Matches controller
  });
});
