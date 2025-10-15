import axiosInstance from "@/Axios/axios";

interface queryData {
  tenant: string;
  keyword: string;
  action: string;
  source: string;
  severity: string;
  date: string;
  startDate: string;
  endDate: string;
  ts: string;
}

export interface logsData {
  tenant: string;
  source: string;
  payload: any;
}

export const getSummary = async (tenant: string) => {
  try {
    const response = await axiosInstance.get("/api/user/get-summary", {
      params: {
        tenant: tenant,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching summary:", error);
    throw error; // Re-throw the error so the caller can handle it
  }
};

export const getLogs = async (data: queryData) => {
  try {
    // Filter out empty values and "ALL" values before sending to API
    const params: Record<string, string> = {};

    if (data.tenant) params.tenant = data.tenant;
    if (data.keyword) params.keyword = data.keyword;
    if (data.action && data.action !== "ALL") params.action = data.action;
    if (data.source && data.source !== "ALL") params.source = data.source;
    if (data.severity) params.severity = data.severity;
    if (data.date && data.date !== "ALL") params.date = data.date;
    if (data.startDate) params.startDate = data.startDate;
    if (data.endDate) params.endDate = data.endDate;
    if (data.ts) params.ts = data.ts;

    const response = await axiosInstance.get("/api/user/get-logs", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
};

export const getLogsAndAlerts = async (tenant: string) => {
  try {
    const response = await axiosInstance.get("/api/user/get-logs-alerts", {
      params: {
        tenant: tenant,
      },
    });
    console.log(tenant);
    return response.data;
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error; // Re-throw the error so the caller can handle it
  }
};

export const createLog = async (data: logsData) => {
  try {
    const response = await axiosInstance.post("/api/admin/ingest", data);
    return response.data;
  } catch (error: any) {
    return {
      message: error.response.data.message || "Failed Log creation",
      success: error.response.data.success || false,
    };
  }
};

// export const getLogs = async (data: queryData) => {
//   try {
//     const response = await axiosInstance.get("/api/user/get-logs", {
//       params: {
//         keyword: data.keyword,
//         tenant: data.tenant,
//         action: data.action,
//         source: data.source,
//         severity: data.severity,
//         date: data.date,
//         startDate: data.startDate,
//         endDate: data.endDate,
//         ts: data.ts,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching summary:", error);
//     throw error; // Re-throw the error so the caller can handle it
//   }
// };
