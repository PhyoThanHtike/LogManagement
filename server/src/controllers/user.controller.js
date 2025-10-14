// controllers/adminController.js
import { LogService } from "../services/logService.js";
import { AlertService } from "../services/alertService.js";
import { normalizeData } from "../utils/normalizeService.js";
import { EmailService } from "../services/emailService.js";
import prisma from "../utils/database.js";
import { LogSources } from "@prisma/client";

export const getLogs = async (req, res) => {
  try {
    const {
      limit = 50,
      cursor, // last cursor for pagination
      kw, // keyword search
      tenant,
      action,
      source,
      severity,
      ts = "desc", // timestamp order
      date, // specific date
      startDate,
      endDate,
    } = req.query;

    // Build filters object
    const filters = {
      keyword: kw,
      tenant,
      action,
      source,
      severity,
      date,
      startDate,
      endDate,
      ts,
    };

    // Remove undefined filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const result = await LogService.getLogsInfinite(
      filters,
      parseInt(limit),
      cursor
    );

    res.status(200).json({
      message: "Logs retrieved successfully with infinite scroll",
      hasNextPage: result.hasNextPage,
      nextCursor: result.nextCursor,
      prevCursor: result.prevCursor,
      data: result.logs,
    });
  } catch (error) {
    console.log("Error in getLog controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
