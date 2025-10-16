// services/alertService.js
import prisma from "../utils/database.js";
import { LogService } from "./logService.js";

export class AlertService {
  static async createAlertRule(ruleData) {
    return await prisma.alertRule.create({
      data: ruleData,
    });
  }

  static async getAlertRules(tenant, filters = {}) {
    const where = { tenant };

    if (filters.logSource) where.logSource = filters.logSource;
    if (filters.isActive !== undefined)
      where.isActive = filters.isActive === "true";

    return await prisma.alertRule.findMany({
      //   where,
      orderBy: { createdAt: "desc" },
      //   include: {
      //     alerts: {
      //       take: 5,
      //       orderBy: { createdAt: 'desc' },
      //     },
      //   },
    });
  }

  static async getAlertRuleById(id, tenant) {
    return await prisma.alertRule.findFirst({
      where: { id, tenant },
    });
  }

  static async updateAlertRule(id, updateData) {
    return await prisma.alertRule.updateMany({
      where: { id },
      data: updateData,
    });
  }

  static async deleteAlertRule(id) {
    return await prisma.alertRule.deleteMany({
      where: { id },
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

  // if (filters.isResolved !== undefined) {
  //   where.isResolved = filters.isResolved === "true";
  // }
  static async getRecentAlerts(filters = {}, limit = 5) {
    const where = LogService.buildWhereClause(filters);
    return await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  static async getAllAlerts(filters = {}) {
    const where = LogService.buildWhereClause(filters);
    return await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async resolveAlert(id) {
    return await prisma.alert.updateMany({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });
  }

  static async deleteAlert(id) {
    return await prisma.alert.delete({
      where: { id },
    });
  }

  static async getDailyAlertsCountPast60Days(filters = {}) {
    const { tenant } = filters;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 60);

    const where = {
      tenant,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const alertsCount = await prisma.alert.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where,
      orderBy: { createdAt: "asc" },
    });

    return alertsCount.map((entry) => ({
      date: entry.createdAt.toISOString().split("T")[0],
      alerts: entry._count.id,
    }));
  }
}
