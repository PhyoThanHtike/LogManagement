// routes/adminRoutes.js
import express from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { adminAuthorization } from "../middleware/adminAuthorization.js";

const router = express.Router();

// All routes require admin privileges
router.use(protectRoute, adminAuthorization);

// Log management routes
router.post("/ingest", AdminController.createLog);
router.get("/logs", AdminController.getLogs);
router.delete("/logs/:id", AdminController.deleteLog);
router.get("/logs/stats", AdminController.getLogStats);

// Alert rule management routes
router.post("/create-rules", AdminController.createAlertRule);
router.get("/alert-rules", AdminController.getAlertRules);
router.put("/alert-rules/:id", AdminController.updateAlertRule);
router.delete("/alert-rules/:id", AdminController.deleteAlertRule);

// Alert management routes
router.get("/alerts", AdminController.getAlerts);
router.patch("/alerts/:id/resolve", AdminController.resolveAlert);

export default router;