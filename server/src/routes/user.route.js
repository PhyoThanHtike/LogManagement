import express from 'express';
import { protectRoute } from "../middleware/protectRoute.js";
import { getLogs, getLogsAndAlerts, getSummary, getTopIPsAndTopSources } from '../controllers/user.controller.js';
import { getRecentAlerts } from '../controllers/admin.controller.js';
import { validateLogQueryMiddleware, validateTenantQueryMiddleware } from '../middleware/queryValidation.js';

const router = express.Router();

router.use(protectRoute);

router.get("/get-logs",validateLogQueryMiddleware, getLogs);
router.get("/get-summary",validateTenantQueryMiddleware, getSummary);
router.get("/get-logs-alerts",validateTenantQueryMiddleware, getLogsAndAlerts);
router.get("/get-top",validateTenantQueryMiddleware, getTopIPsAndTopSources);
router.get("/recent-alerts",validateTenantQueryMiddleware, getRecentAlerts);

export default router;