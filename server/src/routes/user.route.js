import express from 'express';
import { protectRoute } from "../middleware/protectRoute.js";
import { adminAuthorization } from "../middleware/adminAuthorization.js";
import { getLogs, getLogsAndAlerts, getSummary, getTopIPsAndTopSources } from '../controllers/user.controller.js';
import { getRecentAlerts } from '../controllers/admin.controller.js';

const router = express.Router();

router.use(protectRoute);

router.get("/get-logs", getLogs);
router.get("/get-summary", getSummary);
router.get("/get-logs-alerts", getLogsAndAlerts);
router.get("/get-top", getTopIPsAndTopSources);
router.get("/recent-alerts", getRecentAlerts);

export default router;