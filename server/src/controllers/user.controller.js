// controllers/adminController.js
import { LogService } from "../services/logService.js";
import { AlertService } from "../services/alertService.js";

export const getLogs = async (req, res) => {
  try {
    const {
      limit = 50,
      cursor, // last cursor for pagination
      keyword, // keyword search (frontend sends 'keyword' not 'kw')
      tenant,
      action,
      source,
      severity,
      ts = "desc", // timestamp order
      date, // specific date
      startDate,
      endDate,
    } = req.query;

    console.log("Received query parameters:", req.query);

    // Build filters object - map to backend expected names
    const filters = {
      kw: keyword, // Map keyword to kw for the service
      tenant,
      action,
      source,
      severity,
      date,
      startDate,
      endDate,
      ts,
    };

    // Remove undefined or empty string filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined || filters[key] === '' || filters[key] === 'ALL_TENANTS' || filters[key] === 'ALL') {
        delete filters[key];
      }
    });

    console.log("Processed filters for service:", filters);

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
    console.log("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

export const getSummary = async (req, res) => {
  try {
    const { tenant } = req.query;

    console.log("Summary query parameters:", req.query);

    // Build filters object
    const filters = {
      tenant,
    };

    // Remove undefined or "ALL_TENANTS" values
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined || filters[key] === '' || filters[key] === 'ALL_TENANTS') {
        delete filters[key];
      }
    });

    console.log("Processed summary filters:", filters);

    const result = await LogService.getLogsSummary(filters);

    res.status(200).json({
      message: "Logs summary retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.log("Error in getSummary controller", error.message);
    console.log("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

export const getLogsAndAlerts = async (req, res) => {
  try {
    const { tenant } = req.query;


    // Build filters object (consistent with your buildWhereClause)
    const filters = { tenant };

        // Remove undefined or "ALL_TENANTS" values
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined || filters[key] === '' || filters[key] === 'ALL_TENANTS') {
        delete filters[key];
      }
    });

    const [logsData, alertsData] = await Promise.all([
      LogService.getDailyLogsCountPast60Days(filters),
      LogService.getDailyAlertsCountPast60Days(filters),
    ]);

    // Merge both datasets by date
    const mergedMap = new Map();

    logsData.forEach(({ date, logs }) => {
      mergedMap.set(date, { date, logs, alerts: 0 });
    });

    alertsData.forEach(({ date, alerts }) => {
      if (mergedMap.has(date)) {
        mergedMap.get(date).alerts = alerts;
      } else {
        mergedMap.set(date, { date, logs: 0, alerts });
      }
    });

    // Fill missing days (for smooth chart line)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60);
    const endDate = new Date();
    const result = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateKey = d.toISOString().split("T")[0];
      result.push(mergedMap.get(dateKey) || { date: dateKey, logs: 0, alerts: 0 });
    }

    res.status(200).json({
      success: true,
      message: "Logs and Alerts trend (past 60 days)",
      tenant,
      data: result,
    });
  } catch (error) {
    console.error("Error in getLogsAndAlerts controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};