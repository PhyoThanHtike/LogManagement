// services/logService.js
import { LogSources } from "@prisma/client";
import prisma from "../utils/database.js";
import { Prisma } from "@prisma/client";

export class LogService {
  static async createLog(logData) {
    return await prisma.log.create({
      data: logData,
    });
  }

  static async getLogsInfinite(filters = {}, limit = 50, cursor = null) {
    try {
      const where = this.buildWhereClause(filters);

      console.log(
        "Final WHERE clause for query:",
        JSON.stringify(where, null, 2)
      );

      const logs = await prisma.log.findMany({
        where,
        select: {
          id: true,
          timestamp: true,
          tenant: true,
          source: true,
          eventType: true,
          severity: true,
          srcIp: true,
          user: true,
          action: true,
          createdAt: true,
        },
        take: limit + 1, // Get one extra to check if there's more
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { timestamp: filters.ts === "asc" ? "asc" : "desc" },
      });

      const hasNextPage = logs.length > limit;

      if (hasNextPage) {
        logs.pop(); // Remove the extra item
      }

      const nextCursor = logs.length > 0 ? logs[logs.length - 1].id : null;

      return {
        logs,
        hasNextPage,
        nextCursor,
        prevCursor: cursor || undefined,
      };
    } catch (error) {
      console.error("Error in getLogsInfinite:", error);
      throw error;
    }
  }

  static async getLogsSummary(filters = {}) {
    try {
      const where = this.buildWhereClause(filters);

      console.log("Summary WHERE clause:", JSON.stringify(where, null, 2));

      // Get data for both charts in parallel
      const [sourceCounts, severityCounts] = await Promise.all([
        this.getLogsBySource(where),
        this.getLogsBySeverityRanges(where),
      ]);

      return {
        sources: sourceCounts,
        severities: severityCounts,
      };
    } catch (error) {
      console.error("Error in getLogsSummary:", error);
      throw error;
    }
  }

  static async getLogsBySource(whereClause) {
    const sourceCounts = await prisma.log.groupBy({
      by: ["source"],
      where: whereClause,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Transform to chart-friendly format
    return sourceCounts.map((item) => ({
      name: item.source || "Unknown",
      value: item._count.id,
    }));
  }

  static async getLogsBySeverityRanges(whereClause) {
    // Get all logs with severity in the specified range
    const logs = await prisma.log.findMany({
      where: {
        ...whereClause,
        severity: {
          not: null, // Exclude null values
        },
      },
      select: {
        severity: true,
      },
    });

    // Define severity ranges
    const severityRanges = [
      { range: [0, 2], label: "Informational (0-2)" },
      { range: [3, 5], label: "Warning (3-5)" },
      { range: [6, 7], label: "Debug (6-7)" },
      { range: [8, 10], label: "Alert (8-10)" },
    ];

    // Count logs in each range
    const rangeCounts = severityRanges.map((rangeDef) => {
      const [min, max] = rangeDef.range;
      const count = logs.filter(
        (log) => log.severity >= min && log.severity <= max
      ).length;

      return {
        name: rangeDef.label,
        value: count,
        range: `${min}-${max}`,
      };
    });

    // Also include logs with null severity
    const nullSeverityCount = await prisma.log.count({
      where: {
        ...whereClause,
        severity: null,
      },
    });

    if (nullSeverityCount > 0) {
      rangeCounts.push({
        name: "Not Specified",
        value: nullSeverityCount,
        range: "null",
      });
    }

    return rangeCounts.filter((item) => item.value > 0);
  }

  static buildWhereClause(filters) {
    const where = {};

    // Keyword search across multiple fields - use 'kw' from filters
    if (filters.kw) {
      where.OR = [
        { user: { contains: filters.kw, mode: "insensitive" } },
        { eventType: { contains: filters.kw, mode: "insensitive" } },
        { eventSubtype: { contains: filters.kw, mode: "insensitive" } },
        // { action: { contains: filters.kw, mode: "insensitive" } },
        { srcIp: { contains: filters.kw, mode: "insensitive" } },
        { dstIp: { contains: filters.kw, mode: "insensitive" } },
        { host: { contains: filters.kw, mode: "insensitive" } },
        { process: { contains: filters.kw, mode: "insensitive" } },
        { ruleName: { contains: filters.kw, mode: "insensitive" } },
      ];
    }

    // Tenant filter - only add if tenant exists and is not empty
    if (filters.tenant) {
      where.tenant = filters.tenant;
    }

    // Action filter - only add if action exists and is not empty
    if (filters.action) {
      where.action = filters.action;
    }

    // Source filter - only add if source exists and is not empty
    if (filters.source) {
      where.source = filters.source;
    }

    // Severity filter - convert to number if it exists
    if (filters.severity) {
      const severityNum = parseInt(filters.severity);
      if (!isNaN(severityNum)) {
        where.severity = { gte: severityNum };
      }
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.timestamp.lte = new Date(filters.endDate);
      }
    }

    // Specific date filter (for exact day)
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);

      where.timestamp = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return where;
  }

  static async getDailyLogsCountPast60Days(filters = {}) {
    const where = this.buildWhereClause(filters);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 60);

    where.createdAt = {
      gte: startDate,
      lte: endDate,
    };

    const logsCount = await prisma.log.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where,
      orderBy: { createdAt: "asc" },
    });

    // Group by date instead of exact timestamp
    const dailyCounts = {};
    logsCount.forEach((entry) => {
      const dateKey = entry.createdAt.toISOString().split("T")[0];
      if (!dailyCounts[dateKey]) {
        dailyCounts[dateKey] = 0;
      }
      dailyCounts[dateKey] += entry._count.id;
    });

    return Object.entries(dailyCounts).map(([date, logs]) => ({
      date,
      logs,
    }));
  }

  static async getDailyAlertsCountPast60Days(filters = {}) {
    const where = this.buildWhereClause(filters);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 60);

    where.createdAt = {
      gte: startDate,
      lte: endDate,
    };

    const alertsCount = await prisma.alert.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where,
      orderBy: { createdAt: "asc" },
    });

    // Group by date instead of exact timestamp
    const dailyCounts = {};
    alertsCount.forEach((entry) => {
      const dateKey = entry.createdAt.toISOString().split("T")[0];
      if (!dailyCounts[dateKey]) {
        dailyCounts[dateKey] = 0;
      }
      dailyCounts[dateKey] += entry._count.id;
    });

    return Object.entries(dailyCounts).map(([date, alerts]) => ({
      date,
      alerts,
    }));
  }
}
