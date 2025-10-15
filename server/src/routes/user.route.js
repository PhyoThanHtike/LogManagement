import express from 'express';
import { protectRoute } from "../middleware/protectRoute.js";
import { adminAuthorization } from "../middleware/adminAuthorization.js";
import { getLogs, getLogsAndAlerts, getSummary } from '../controllers/user.controller.js';

const router = express.Router();

router.get("/get-logs", protectRoute, getLogs);
router.get("/get-summary", protectRoute, getSummary);
router.get("/get-logs-alerts", protectRoute, getLogsAndAlerts);

export default router;