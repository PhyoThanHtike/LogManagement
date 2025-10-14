import express from 'express';
import { protectRoute } from "../middleware/protectRoute.js";
import { adminAuthorization } from "../middleware/adminAuthorization.js";
import { getLogs } from '../controllers/user.controller.js';

const router = express.Router();

router.get("/get-logs", protectRoute, getLogs);

export default router;