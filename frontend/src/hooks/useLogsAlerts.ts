// src/hooks/useSummaryQuery.ts
import { useQuery } from "@tanstack/react-query";
import { getLogsAndAlerts } from "@/apiEndpoints/Logs";
import { useFilterStore } from "@/store/FilterStore";

export const useLogsAlertsQuery = () => {
  const tenant = useFilterStore((state) => state.tenant);

  return useQuery({
    queryKey: ["logsalerts", tenant],
    queryFn: () => getLogsAndAlerts(tenant),
    enabled: !!tenant, // Only fetch if tenant is selected
    staleTime: 1000 * 60 * 5, // 5 minutes for summary data
    // cacheTime: 1000 * 60 * 15, // 15 minutes
  });
};