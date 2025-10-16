import axiosInstance from "@/Axios/axios";
// Alert Types
export interface Alert {
  id: string;
  severity: number;
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  tenant: string;
}

export interface AlertRule {
  id: string;
  ruleName: string;
  logSource: string;
  severity: number;
  description?: string;
  tenant: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertRuleData {
  tenant: string;
  ruleName: string;
  logSource: string;
  severity: number;
  description?: string;
}

// Alert Rules API Calls
export const createAlertRule = async (alertRuleData: CreateAlertRuleData) => {
  try {
    const response = await axiosInstance.post(
      "/api/admin/create-rules",
      alertRuleData
    );
    return response.data;
  } catch (error: any) {
    return {
      message: error.response?.data?.message || "Failed to create alert rule",
      success: false,
    };
  }
};

export const getAlertRules = async (tenant: string) => {
  try {
    const response = await axiosInstance.get("/api/admin/alert-rules", {
      params: {
        tenant: tenant,
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      message: error.response?.data?.message || "Failed to fetch alert rules",
      success: false,
      alertRules: [],
    };
  }
};

export const updateAlertRule = async (id: string, updateData: any) => {
  try {
    const response = await axiosInstance.put(
      `/api/admin/alert-rules/${id}`,
      updateData
    );
    return response.data;
  } catch (error: any) {
    return {
      message: error.response?.data?.message || "Failed to update alert rule",
      success: false,
    };
  }
};

export const deleteAlertRule = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/alert-rules/${id}`);
    return response.data;
  } catch (error: any) {
    return {
      message: error.response?.data?.message || "Failed to delete alert rule",
      success: false,
    };
  }
};

// Alert Management API Calls
export const getRecentAlerts = async (tenant: string) => {
  try {
    const response = await axiosInstance.get("/api/user/recent-alerts", {
      params: {
        tenant: tenant,
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      message: error.response?.data?.message || "Failed to fetch recent alerts",
      success: false,
      data: [],
      count: 0,
    };
  }
};

export const getAllAlerts = async (tenant: string) => {
  try {
    const response = await axiosInstance.get("/api/admin/alerts", {
      params: {
        tenant: tenant,
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      message: error.response?.data?.message || "Failed to fetch all alerts",
      success: false,
      data: [],
      count: 0,
    };
  }
};

export const resolveAlert = async (id: string) => {
  try {
    const response = await axiosInstance.patch(
      `/api/admin/alerts/${id}/resolve`
    );
    return response.data;
  } catch (error: any) {
    return {
      message: error.response?.data?.message || "Failed to resolve alert",
      success: false,
    };
  }
};

export const deleteAlert = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/alerts/${id}`);
    return response.data;
  } catch (error: any) {
    return {
      message: error.response?.data?.message || "Failed to delete alert",
      success: false,
    };
  }
};