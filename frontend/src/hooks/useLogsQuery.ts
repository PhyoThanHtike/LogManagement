// src/hooks/useLogsQuery.ts
import { useQuery } from "@tanstack/react-query";
import { getLogs } from "@/apiEndpoints/Logs";
// import { useFilterStore } from "@/store/filterStore";
import { useFilterStore } from "@/store/FilterStore";
import { useDebouncedValue } from "./useDebouncedValue";

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
    queryFn: () => getLogs({
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
    enabled: !!filters.tenant, // Only fetch if tenant is selected
    staleTime: 1000 * 60 * 2, // 2 minutes
    // cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};