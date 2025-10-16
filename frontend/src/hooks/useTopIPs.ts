import { useQuery } from "@tanstack/react-query";
import { getTopIPsAndTopSources } from "@/apiEndpoints/Logs";

export const useTopIPsQuery = () => {

  return useQuery({
    queryKey: ["topips"],
    queryFn: () => getTopIPsAndTopSources,
    staleTime: 1000 * 60 * 5, // 5 minutes for summary data
    // cacheTime: 1000 * 60 * 15, // 15 minutes
  });
};