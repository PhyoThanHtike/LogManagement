// src/hooks/useSummaryQuery.ts
import { useQuery } from "@tanstack/react-query";
import { getSummary } from "@/apiEndpoints/Logs";
import { useFilterStore } from "@/store/FilterStore";

export const useSummaryQuery = () => {
  const tenant = useFilterStore((state) => state.tenant);

  return useQuery({
    queryKey: ["summary", tenant],
    queryFn: () => getSummary(tenant),
    enabled: !!tenant, // Only fetch if tenant is selected
    staleTime: 1000 * 60 * 5, // 5 minutes for summary data
    // cacheTime: 1000 * 60 * 15, // 15 minutes
  });
};