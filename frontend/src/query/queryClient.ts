// src/query/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

// ✅ Create a pure, reusable QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // retry twice on failure
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes before data considered stale
      gcTime: 1000 * 60 * 10, // 10 minutes cache garbage collection
    },
  },
});

// ✅ Utility to invalidate logs, alerts, and summary queries globally
export const invalidateLogsAlerts = async (tenant:any) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["logs", tenant], exact: false }),
    queryClient.invalidateQueries({ queryKey: ["recentalerts", tenant], exact: false }),
    queryClient.invalidateQueries({ queryKey: ["summary", tenant], exact: false }),
  ]);
};
