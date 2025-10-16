// src/components/Dashboard.tsx
import React, { useEffect, useMemo, useCallback, Suspense } from "react";
import { useFilterStore } from "@/store/FilterStore";
import { useFilterSearchParams } from "@/hooks/useSearchParams";
import {
  useLogsQuery,
  useSummaryQuery,
  useLogsAlertsQuery,
  useTopIPsQuery,
  useRecentAlertsQuery,
} from "@/hooks/useCustomQuery";

import ActionFilter from "@/AppComponents/Dropdowns/ActionFilter";
import SourceFilter from "@/AppComponents/Dropdowns/SourceFilter";
import SearchBar from "@/AppComponents/Dropdowns/SearchBar";
import { Button } from "@/components/ui/button";
import { RefreshCw, FilterX } from "lucide-react";
import { useUserStore } from "@/store/UserStore";
import DateFilter from "@/AppComponents/Dropdowns/DateFilter";
import { Card, CardHeader } from "@/components/ui/card";
import Spinner from "@/AppComponents/Charts/Spinner";
import { deleteAlert, resolveAlert } from "@/apiEndpoints/Alert";

// lazy imports for heavy components (charts, tables)
const SummaryChart = React.lazy(() => import("@/AppComponents/Charts/SummaryChart"));
const LogsAlertsTrendChart = React.lazy(() => import("@/AppComponents/Charts/LogsAlertsChart"));
const TopIPSourcesTable = React.lazy(() => import("@/AppComponents/Table/TopIPSourcesTable"));
const AlertsTable = React.lazy(() => import("@/AppComponents/Table/AlertsTable"));
const LogsTable = React.lazy(() => import("@/AppComponents/Table/LogsTable"));

// small debounce hook defined inline (you can move it to hooks/useDebouncedCallback.ts)
function useDebouncedCallback<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  const ref = React.useRef<{ timeout?: number | NodeJS.Timeout; fn: T }>({ fn });
  useEffect(() => { ref.current.fn = fn; }, [fn]);
  return useCallback((...args: Parameters<T>) => {
    if (ref.current.timeout) clearTimeout(ref.current.timeout as any);
    ref.current.timeout = setTimeout(() => {
      ref.current.fn(...args);
    }, delay);
  }, [delay]);
}

const Dashboard: React.FC = () => {
  // Keep search param syncing (side-effect)
  useFilterSearchParams();

  // IMPORTANT: prefer selecting only the specific parts of the store you need
  // If your store supports selectors (Zustand pattern), do this to avoid full-store subscription re-renders:
  // const action = useFilterStore((s) => s.action);
  // const setAction = useFilterStore((s) => s.setAction);
  // For now, keep your single object (but switch to selectors for best perf).
  const filters = useFilterStore();

  // queries
  const { user } = useUserStore();
  const { data: summaryData, isLoading: summaryLoading } = useSummaryQuery();
  const {
    data: logsData,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useLogsQuery();
  const { data: logsAlertsData, isLoading: logsAlertsLoading } =
    useLogsAlertsQuery();
  const {
    data: topIPsData,
    isLoading: topIPsLoading,
    error: topIPsError,
  } = useTopIPsQuery();
  const { data: alertsData, isLoading: alertsLoading } = useRecentAlertsQuery();

  useEffect(() => {
    if (user) {
      filters.initializeTenant(user.role, user.tenant);
    }
  }, [user, filters]);

  const handleReset = useCallback(() => {
    filters.reset();
    if (user) {
      filters.initializeTenant(user.role, user.tenant);
    }
  }, [filters, user]);

  const handleDeleteAlerts = useCallback(async (alertId: string) => {
    return await deleteAlert(alertId);
  }, []);

  const handleResolveAlerts = useCallback(async (alertId: string) => {
    return await resolveAlert(alertId);
  }, []);

  // debounce the refetch to avoid repeated immediate refetching
  const debouncedRefetchLogs = useDebouncedCallback(() => refetchLogs?.(), 300);

  const isLoading = summaryLoading || logsLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 px-6">
      <div className="max-w-full mx-auto">
        {/* Logs alerts charts — lazy loaded */}
        <Suspense fallback={<Spinner size="lg" color="primary" />}>
          {logsAlertsLoading ? (
            <Spinner size="lg" color="primary" />
          ) : (
            logsAlertsData && <LogsAlertsTrendChart rawData={logsAlertsData} />
          )}
        </Suspense>

        <Suspense fallback={<Spinner size="sm" color="primary" />}>
          {summaryLoading ? (
            <Spinner size="sm" color="primary" />
          ) : (
            summaryData && <SummaryChart data={summaryData.data} />
          )}
        </Suspense>

        <Suspense fallback={<Spinner size="sm" color="primary" />}>
          {topIPsLoading ? (
            <Spinner size="sm" color="primary" />
          ) : (
            topIPsData && <TopIPSourcesTable data={topIPsData} />
          )}
        </Suspense>

        <Suspense fallback={<Spinner size="sm" color="primary" />}>
          {alertsLoading ? (
            <Spinner size="sm" color="primary" />
          ) : (
            alertsData && (
              <AlertsTable
                data={alertsData}
                desc="Recent"
                userRole={user?.role}
                onDeleteAlert={handleDeleteAlerts}
                onResolveAlert={handleResolveAlerts}
              />
            )
          )}
        </Suspense>

        {/* Table Section */}
        <Card className="p-6 mt-6 mb-6">
          <CardHeader className="flex mb-6 justify-between items center">
            <h1 className="text-xl font-bold">Log Details</h1>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <FilterX className="h-4 w-4" />
                Clear Filters
              </Button>
              <Button
                onClick={() => debouncedRefetchLogs()}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action
              </label>
              <ActionFilter
                value={filters.action}
                onValueChange={filters.setAction}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source
              </label>
              <SourceFilter
                value={filters.source}
                onValueChange={filters.setSource}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <DateFilter value={filters.date} onValueChange={filters.setDate} />
            </div>

            <div className="md:col-span-2 lg:col-span-4 xl:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Keywords
              </label>
              <SearchBar
                value={filters.keyword}
                onValueChange={filters.setKeyword}
              />
            </div>
          </div>

          {logsLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                />
              ))}
            </div>
          ) : (
            <Suspense fallback={<Spinner size="sm" color="primary" />}>
              {logsData && (
                // IMPORTANT: Switch LogsTable to a virtualized list internally.
                <LogsTable userRole={user?.role} logs={logsData.data} />
              )}
            </Suspense>
          )}
        </Card>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
