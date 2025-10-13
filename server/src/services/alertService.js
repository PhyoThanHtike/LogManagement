// services/alertService.js
import prisma from "../utils/database.js";

export class AlertService {
  static async createAlertRule(ruleData) {
    return await prisma.alertRule.create({
      data: ruleData,
    });
  }

  static async getAlertRules(tenant, filters = {}) {
    const where = { tenant };
    
    if (filters.logSource) where.logSource = filters.logSource;
    if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';

    return await prisma.alertRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        alerts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  static async getAlertRuleById(id, tenant) {
    return await prisma.alertRule.findFirst({
      where: { id, tenant },
    });
  }

  static async updateAlertRule(id, tenant, updateData) {
    return await prisma.alertRule.updateMany({
      where: { id, tenant },
      data: updateData,
    });
  }

  static async deleteAlertRule(id, tenant) {
    return await prisma.alertRule.deleteMany({
      where: { id, tenant },
    });
  }

  static async checkAlertRules(log) {
    const matchingRules = await prisma.alertRule.findMany({
      where: {
        tenant: log.tenant,
        logSource: log.source,
        severity: { lte: log.severity || 0 },
        isActive: true,
      },
    });

    const createdAlerts = [];
    
    for (const rule of matchingRules) {
      const alert = await prisma.alert.create({
        data: {
          tenant: log.tenant,
          alertRuleId: rule.id,
          logId: log.id,
          ruleName: rule.ruleName,
          severity: log.severity || 0,
          description: `Alert triggered for ${log.source} event: ${log.eventType}`,
        },
        include: {
          log: true,
          alertRule: true,
        },
      });
      
      createdAlerts.push(alert);
    }

    return createdAlerts;
  }

  static async getAlerts(tenant, filters = {}, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    const where = { tenant };
    
    if (filters.isResolved !== undefined) {
      where.isResolved = filters.isResolved === 'true';
    }
    if (filters.severity) {
      where.severity = { gte: parseInt(filters.severity) };
    }

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          log: true,
          alertRule: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.alert.count({ where }),
    ]);

    return {
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async resolveAlert(id, tenant) {
    return await prisma.alert.updateMany({
      where: { id, tenant },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });
  }
}