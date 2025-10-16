// controllers/adminController.js
import { LogService } from "../services/logService.js";
import { AlertService } from "../services/alertService.js";
import { normalizeData } from "../utils/normalizeService.js";
import { EmailService } from "../services/emailService.js";
import prisma from "../utils/database.js";
import { LogSources } from "@prisma/client";
import { UserService } from "../services/userService.js";

// Log management
export const createLog = async (req, res) => {
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
          role: "ADMIN",
          status: "ACTIVE",
          isVerified: true,
        },
        select: { email: true },
      });

      const adminEmails = adminUsers.map((user) => user.email);

      // Send alert emails (fire and forget)
      alerts.forEach((alert) => {
        EmailService.sendAlertEmail(adminEmails, alert, log).catch((err) =>
          console.error("Failed to send alert email:", err)
        );
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
};

export const deleteLog = async (req, res) => {
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
};

export const createAlertRule = async (req, res) => {
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
};

export const getAlertRules = async (req, res) => {
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
};

export const updateAlertRule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await AlertService.updateAlertRule(id, updateData);

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
};

export const deleteAlertRule = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await AlertService.deleteAlertRule(id);

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
};

// Alert management
export const getRecentAlerts = async (req, res) => {
  try {
    const { tenant } = req.query;
    const filters = {
      tenant,
    };

    // Remove undefined or "ALL_TENANTS" values
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] === undefined ||
        filters[key] === "" ||
        filters[key] === "ALL_TENANTS"
      ) {
        delete filters[key];
      }
    });
    const alerts = await AlertService.getRecentAlerts(filters, 5);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.log("Error in getRecentAlerts controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllAlerts = async (req, res) => {
  try {
    const { tenant } = req.query;
    const filters = {
      tenant,
    };

    // Remove undefined or "ALL_TENANTS" values
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] === undefined ||
        filters[key] === "" ||
        filters[key] === "ALL_TENANTS"
      ) {
        delete filters[key];
      }
    });
    const alerts = await AlertService.getAllAlerts(filters);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.log("Error in getAllAlerts controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await AlertService.resolveAlert(id);

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
};

export const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await AlertService.deleteAlert(id);

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteAlertRule controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password, name, role, status, tenant } = req.body;

    // Validate required fields
    if (!email || !password || !name || !tenant) {
      return res.status(400).json({
        error:
          "Missing required fields: email, password, name, and tenant are required",
      });
    }

    // Check if user already exists
    const existingUser = await UserService.findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    // Create new user
    const newUser = await UserService.createUser({
      email,
      password, // Remember to hash in production
      name,
      role,
      status,
      tenant,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      password,
      name,
      role,
      status,
      loginAttempts,
      isVerified,
      tenant,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    // Check if user exists
    const existingUser = await UserService.findUserById(id);

    if (!existingUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Check if email is being updated and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await UserService.checkEmailExists(email, id);

      if (emailExists) {
        return res.status(409).json({
          error: "Email already in use by another user",
        });
      }
    }

    // Prepare update data
    const updateData = {};

    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (loginAttempts !== undefined) updateData.loginAttempts = loginAttempts;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (tenant !== undefined) updateData.tenant = tenant;

    // Update user
    const updatedUser = await UserService.updateUser(id, updateData);

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    // Check if user exists
    const existingUser = await UserService.findUserById(id);

    if (!existingUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Delete the user
    await UserService.deleteUser(id);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const toggleRestrict = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    // Check if user exists
    const existingUser = await UserService.findUserById(id);

    if (!existingUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Toggle user status
    const updatedUser = await UserService.toggleUserStatus(id);

    const action =
      updatedUser.status === "RESTRICTED" ? "restricted" : "activated";

    return res.status(200).json({
      message: `User ${action} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error toggling user restriction:", error);

    if (error.message === "User not found") {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
