// src/hooks/useLogsQuery.ts
import { useQuery } from "@tanstack/react-query";
import {
  getLogs,
  getLogsAndAlerts,
  getSummary,
  getTopIPsAndTopSources,
} from "@/apiEndpoints/Logs";
import { getAlertRules, getAllAlerts, getRecentAlerts } from "@/apiEndpoints/Alert";
import { useFilterStore } from "@/store/FilterStore";
import { useDebouncedValue } from "./useDebouncedValue";
import { getUsers } from "@/apiEndpoints/User";

export const useLogsQuery = () => {
  const filters = useFilterStore();
  const debouncedKeyword = useDebouncedValue(filters.keyword, 500);

  return useQuery({
    queryKey: [
      "logs",
      filters.tenant,
      debouncedKeyword,
      filters.action,
      filters.source,
      filters.severity,
      filters.date,
      filters.startDate,
      filters.endDate,
      filters.ts,
    ],
    queryFn: () =>
      getLogs({
        tenant: filters.tenant,
        keyword: debouncedKeyword,
        action: filters.action,
        source: filters.source,
        severity: filters.severity,
        date: filters.date,
        startDate: filters.startDate,
        endDate: filters.endDate,
        ts: filters.ts,
      }),
    enabled: !!filters.tenant,
    staleTime: 1000 * 60 * 2,
  });
};

export const useLogsAlertsQuery = () => {
  const tenant = useFilterStore((state) => state.tenant);

  return useQuery({
    queryKey: ["logs-alerts", tenant],
    queryFn: () => getLogsAndAlerts(tenant),
    enabled: !!tenant,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAllUsersQuery = () => {
  const tenant = useFilterStore((state) => state.tenant);
  return useQuery({
    queryKey: ["allUsers", tenant],
    queryFn: () => getUsers(tenant), // ✅ fixed invocation
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecentAlertsQuery = () => {
  const tenant = useFilterStore((state) => state.tenant);
  return useQuery({
    queryKey: ["recentalerts", tenant],
    queryFn: () => getRecentAlerts(tenant), // ✅ fixed invocation
    staleTime: 1000 * 60 * 5,
  });
};

export const useAllAlertsQuery = () => {
  const tenant = useFilterStore((state) => state.tenant);
  return useQuery({
    queryKey: ["allalerts", tenant],
    queryFn: () => getAllAlerts(tenant), // ✅ fixed invocation
    staleTime: 1000 * 60 * 5,
  });
};

export const useAlertRulesQuery = () => {
  const tenant = useFilterStore((state) => state.tenant);
  return useQuery({
    queryKey: ["alertRules", tenant],
    queryFn: () => getAlertRules(tenant), // ✅ fixed invocation
    staleTime: 1000 * 60 * 5,
  });
};

export const useSummaryQuery = () => {
  const tenant = useFilterStore((state) => state.tenant);

  return useQuery({
    queryKey: ["summary", tenant],
    queryFn: () => getSummary(tenant),
    enabled: !!tenant,
    staleTime: 1000 * 60 * 5,
  });
};

export const useTopIPsQuery = () => {
  const tenant = useFilterStore((state) => state.tenant);

  return useQuery({
    queryKey: ["top-ips", tenant],
    queryFn: () => getTopIPsAndTopSources(tenant),
    enabled: !!tenant,
    staleTime: 1000 * 60 * 5,
  });
};
