// services/logService.js
import prisma from "../utils/database.js";

export class LogService {
  static async createLog(logData) {
    return await prisma.log.create({
      data: logData,
    });
  }

  static async getLogsInfinite(filters = {}, limit = 50, cursor = null) {
    const where = this.buildWhereClause(filters);

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
  }

  static async getLogsSummary(filters = {}) {
    const where = this.buildWhereClause(filters);

    // Get data for both charts in parallel
    const [sourceCounts, severityCounts, actionCounts] = await Promise.all([
      this.getLogsBySource(where),
      this.getLogsBySeverity(where),
      this.getLogsByAction(where),
    ]);

    return {
      sources: sourceCounts,
      severities: severityCounts,
      actions: actionCounts,
    };
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
      { range: [0, 2], label: "Critical (0-2)" },
      { range: [3, 5], label: "Warning (3-5)" },
      { range: [6, 7], label: "Informational (6-7)" },
      { range: [8, 10], label: "Debug (8-10)" },
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

    // Keyword search across multiple fields
    if (filters.keyword) {
      where.OR = [
        { user: { contains: filters.keyword, mode: "insensitive" } },
        { eventType: { contains: filters.keyword, mode: "insensitive" } },
        { eventSubtype: { contains: filters.keyword, mode: "insensitive" } },
        { srcIp: { contains: filters.keyword, mode: "insensitive" } },
        { dstIp: { contains: filters.keyword, mode: "insensitive" } },
        { host: { contains: filters.keyword, mode: "insensitive" } },
        { process: { contains: filters.keyword, mode: "insensitive" } },
        { ruleName: { contains: filters.keyword, mode: "insensitive" } },
      ];
    }

    // Tenant filter
    if (filters.tenant && filters.tenant !== "all") {
      where.tenant = filters.tenant;
    }

    // Action filter
    if (filters.action && filters.action !== "all") {
      where.action = filters.action;
    }

    // Source filter
    if (filters.source && filters.source !== "all") {
      where.source = filters.source;
    }

    // Severity filter
    if (filters.severity) {
      where.severity = { gte: parseInt(filters.severity) };
    }

    // Date filter
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = new Date(filters.startDate);
      if (filters.endDate) where.timestamp.lte = new Date(filters.endDate);
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
}

//   static async getLogStats(tenant) {
//     const stats = await prisma.log.groupBy({
//       by: ['source', 'severity'],
//       where: { tenant },
//       _count: { id: true },
//     });

//     return stats.reduce((acc, stat) => {
//       if (!acc[stat.source]) acc[stat.source] = {};
//       acc[stat.source][stat.severity] = stat._count.id;
//       return acc;
//     }, {});
//   }

//   static async getLogs(tenant, filters = {}, page = 1, limit = 50) {
//     const skip = (page - 1) * limit;

//     const where = { tenant };

//     // Apply filters
//     if (filters.source) where.source = filters.source;
//     if (filters.eventType)
//       where.eventType = { contains: filters.eventType, mode: "insensitive" };
//     if (filters.severity) where.severity = { gte: parseInt(filters.severity) };
//     if (filters.user)
//       where.user = { contains: filters.user, mode: "insensitive" };
//     if (filters.startDate || filters.endDate) {
//       where.timestamp = {};
//       if (filters.startDate) where.timestamp.gte = new Date(filters.startDate);
//       if (filters.endDate) where.timestamp.lte = new Date(filters.endDate);
//     }

//     const [logs, total] = await Promise.all([
//       prisma.log.findMany({
//         where,
//         orderBy: { timestamp: "desc" },
//         skip,
//         take: limit,
//       }),
//       prisma.log.count({ where }),
//     ]);

//     return {
//       logs,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     };
//   }

//   static async getLogById(id, tenant) {
//     return await prisma.log.findFirst({
//       where: { id, tenant },
//     });
//   }

//   static async deleteLog(id, tenant) {
//     return await prisma.log.deleteMany({
//       where: { id, tenant },
//     });
//   }
