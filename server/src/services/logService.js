// services/logService.js
import prisma from "../utils/database.js";

export class LogService {
  static async createLog(logData) {
    return await prisma.log.create({
      data: logData,
    });
  }

  static async getLogs(tenant, filters = {}, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    const where = { tenant };
    
    // Apply filters
    if (filters.source) where.source = filters.source;
    if (filters.eventType) where.eventType = { contains: filters.eventType, mode: 'insensitive' };
    if (filters.severity) where.severity = { gte: parseInt(filters.severity) };
    if (filters.user) where.user = { contains: filters.user, mode: 'insensitive' };
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = new Date(filters.startDate);
      if (filters.endDate) where.timestamp.lte = new Date(filters.endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.log.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getLogById(id, tenant) {
    return await prisma.log.findFirst({
      where: { id, tenant },
    });
  }

  static async deleteLog(id, tenant) {
    return await prisma.log.deleteMany({
      where: { id, tenant },
    });
  }

  static async getLogStats(tenant) {
    const stats = await prisma.log.groupBy({
      by: ['source', 'severity'],
      where: { tenant },
      _count: { id: true },
    });

    return stats.reduce((acc, stat) => {
      if (!acc[stat.source]) acc[stat.source] = {};
      acc[stat.source][stat.severity] = stat._count.id;
      return acc;
    }, {});
  }
}