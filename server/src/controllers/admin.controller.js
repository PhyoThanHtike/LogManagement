// controllers/adminController.js
import { LogService } from "../services/logService.js";
import { AlertService } from "../services/alertService.js";
import { normalizeData } from "../utils/normalizeService.js";
import { EmailService } from "../services/emailService.js";
import prisma from "../utils/database.js";
import { LogSources } from "@prisma/client";

export class AdminController {
  // Log management
  static async createLog(req, res) {
    try {
      const { tenant, source, payload } = req.body;
      const user = req.user;

      // Validate input
      if (!tenant || !source || !payload) {
        return res.status(400).json({
          success: false,
          message: "Tenant, source, and payload are required",
        });
      }

      // Validate source
      if (!Object.values(LogSources).includes(source)) {
        return res.status(400).json({
          success: false,
          message: "Invalid log source",
        });
      }

      // Normalize the log data
      const normalizedLog = normalizeData(tenant, source, payload);

      // Create log in database
      const log = await LogService.createLog(normalizedLog);

      // Check for matching alert rules
      const alerts = await AlertService.checkAlertRules(log);

      // If alerts were created, send email notifications to all admins
      if (alerts.length > 0) {
        const adminUsers = await prisma.user.findMany({
          where: {
            role: 'ADMIN',
            status: 'ACTIVE',
            isVerified: true,
          },
          select: { email: true },
        });

        const adminEmails = adminUsers.map(user => user.email);
        
        // Send alert emails (fire and forget)
        alerts.forEach(alert => {
          EmailService.sendAlertEmail(adminEmails, alert, log)
            .catch(err => console.error('Failed to send alert email:', err));
        });
      }

      res.status(201).json({
        success: true,
        message: "Log created successfully",
        log,
        alertsTriggered: alerts.length,
      });
    } catch (error) {
      console.log("Error in createLog controller", error.message);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  static async getLogs(req, res) {
    try {
      const { tenant } = req.user;
      const { page = 1, limit = 50, ...filters } = req.query;

      const result = await LogService.getLogs(
        tenant,
        filters,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.log("Error in getLogs controller", error.message);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  static async deleteLog(req, res) {
    try {
      const { id } = req.params;
      const { tenant } = req.user;

      const result = await LogService.deleteLog(id, tenant);

      if (result.count === 0) {
        return res.status(404).json({
          success: false,
          message: "Log not found",
        });
      }

      res.json({
        success: true,
        message: "Log deleted successfully",
      });
    } catch (error) {
      console.log("Error in deleteLog controller", error.message);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  static async getLogStats(req, res) {
    try {
      const { tenant } = req.user;

      const stats = await LogService.getLogStats(tenant);

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.log("Error in getLogStats controller", error.message);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  // Alert Rule management
  static async createAlertRule(req, res) {
    try {
    //   const { tenant } = req.user;
      const { tenant, ruleName, logSource, severity, description } = req.body;

      if (!ruleName || !logSource || severity === undefined) {
        return res.status(400).json({
          success: false,
          message: "Rule name, log source, and severity are required",
        });
      }

      if (severity < 0 || severity > 10) {
        return res.status(400).json({
          success: false,
          message: "Severity must be between 0 and 10",
        });
      }

      const alertRule = await AlertService.createAlertRule({
        tenant,
        ruleName,
        logSource,
        severity: parseInt(severity),
        description,
      });

      res.status(201).json({
        success: true,
        message: "Alert rule created successfully",
        alertRule,
      });
    } catch (error) {
      console.log("Error in createAlertRule controller", error.message);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  static async getAlertRules(req, res) {
    try {
      const { tenant } = req.user;
      const filters = req.query;

      const alertRules = await AlertService.getAlertRules(tenant, filters);

      res.json({
        success: true,
        alertRules,
      });
    } catch (error) {
      console.log("Error in getAlertRules controller", error.message);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  static async updateAlertRule(req, res) {
    try {
      const { id } = req.params;
      const { tenant } = req.user;
      const updateData = req.body;

      const result = await AlertService.updateAlertRule(id, tenant, updateData);

      if (result.count === 0) {
        return res.status(404).json({
          success: false,
          message: "Alert rule not found",
        });
      }

      res.json({
        success: true,
        message: "Alert rule updated successfully",
      });
    } catch (error) {
      console.log("Error in updateAlertRule controller", error.message);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  static async deleteAlertRule(req, res) {
    try {
      const { id } = req.params;
      const { tenant } = req.user;

      const result = await AlertService.deleteAlertRule(id, tenant);

      if (result.count === 0) {
        return res.status(404).json({
          success: false,
          message: "Alert rule not found",
        });
      }

      res.json({
        success: true,
        message: "Alert rule deleted successfully",
      });
    } catch (error) {
      console.log("Error in deleteAlertRule controller", error.message);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  // Alert management
  static async getAlerts(req, res) {
    try {
      const { tenant } = req.user;
      const { page = 1, limit = 50, ...filters } = req.query;

      const result = await AlertService.getAlerts(
        tenant,
        filters,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.log("Error in getAlerts controller", error.message);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  static async resolveAlert(req, res) {
    try {
      const { id } = req.params;
      const { tenant } = req.user;

      const result = await AlertService.resolveAlert(id, tenant);

      if (result.count === 0) {
        return res.status(404).json({
          success: false,
          message: "Alert not found",
        });
      }

      res.json({
        success: true,
        message: "Alert resolved successfully",
      });
    } catch (error) {
      console.log("Error in resolveAlert controller", error.message);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
}