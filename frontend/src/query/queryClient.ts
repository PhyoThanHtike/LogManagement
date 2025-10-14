// src/query/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // retry twice on failure
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // exp backoff
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes by default (tweak per-query)
      cacheTime: 1000 * 60 * 10, // 10 minutes
      useErrorBoundary: false,
    },
  },
});
