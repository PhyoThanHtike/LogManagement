import { useQuery } from "@tanstack/react-query";
import { getRecentAlerts } from "@/apiEndpoints/Alert";

export const useRecentAlertsQuery = () => {

  return useQuery({
    queryKey: ["recentAlerts"],
    queryFn: () => getRecentAlerts,
    staleTime: 1000 * 60 * 5, // 5 minutes for summary data
    // cacheTime: 1000 * 60 * 15, // 15 minutes
  });
};