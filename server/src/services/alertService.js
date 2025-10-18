// services/alertService.js
import prisma from "../utils/database.js";
import { LogService } from "./logService.js";
import { EmailService } from "./emailService.js";
import { normalizeData } from "../utils/normalizeService.js";

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

  static async loginAlert(tenant, payload) {
    const source = "API";

    try {
      // Normalize the log data
      const normalizedLog = normalizeData(tenant, source, payload);

      // Create log in database
      const log = await LogService.createLog(normalizedLog);

      // Find or create an alert rule for login attempts
      let alertRule = await prisma.alertRule.findFirst({
        where: {
          ruleName: "Consecutive Failed Login Attempts",
          tenant: tenant,
        },
      });

      if (!alertRule) {
        alertRule = await prisma.alertRule.create({
          data: {
            tenant: tenant,
            ruleName: "Consecutive Failed Login Attempts",
            logSource: "API",
            severity: 9,
            isActive: true,
            description: "Alert for consecutive failed login attempts",
          },
        });
      }

      const alert = await prisma.alert.create({
        data: {
          tenant: log.tenant,
          alertRuleId: alertRule.id,
          logId: log.id,
          ruleName: alertRule.ruleName,
          severity: log.severity || 9,
          description: `Alert triggered for ${log.source} event: ${log.eventType}`,
        },
        include: {
          log: true,
          alertRule: true,
        },
      });

      // Get admin users and send emails
      const adminUsers = await prisma.user.findMany({
        where: {
          role: "ADMIN",
          status: "ACTIVE",
          isVerified: true,
        },
        select: { email: true },
      });

      const adminEmails = adminUsers.map((user) => user.email);

      EmailService.sendAlertEmail(adminEmails, alert, log).catch((err) =>
        console.error("Failed to send alert email:", err)
      );
    } catch (error) {
      console.error("Error in loginAlert:", error);
    }
  }
}
