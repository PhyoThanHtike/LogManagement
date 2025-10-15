// routes/adminRoutes.js
import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { adminAuthorization } from "../middleware/adminAuthorization.js";
import {
  createLog,
  deleteLog,
  createAlertRule,
  getAlertRules,
  updateAlertRule,
  deleteAlertRule,
  resolveAlert,
  createUser,
  updateUser,
  deleteUser,
  toggleRestrict,
  getRecentAlerts,
  getAllAlerts
} from "../controllers/admin.controller.js";

const router = express.Router();

// All routes require admin privileges
router.use(protectRoute, adminAuthorization);

// Log management routes
router.post("/ingest", createLog);
router.delete("/logs/:id", deleteLog);

// Alert rule management routes
router.post("/create-rules", createAlertRule);
router.get("/alert-rules", getAlertRules);
router.put("/alert-rules/:id", updateAlertRule);
router.delete("/alert-rules/:id", deleteAlertRule);

// Alert management routes
router.get("/recent-alerts", getRecentAlerts);
router.get("/alerts", getAllAlerts);
router.patch("/alerts/:id/resolve", resolveAlert);

//User management routes
router.post("/create-user", createUser);
router.put('/update-user/:id', updateUser);
router.delete("/delete-user", deleteUser);
router.patch('/restrict-user/:id', toggleRestrict);

export default router;
