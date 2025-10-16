// src/components/Dashboard.tsx
import React, { useEffect, useCallback, Suspense } from "react";
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
import { deleteAlert, resolveAlert } from "@/apiEndpoints/Alert";
import LoadingScreen from "@/Layout/LoadingScreen";
import { deleteLog } from "@/apiEndpoints/Logs";

// Lazy-loaded components
const SummaryChart = React.lazy(() => import("@/AppComponents/Charts/SummaryChart"));
const LogsAlertsTrendChart = React.lazy(() => import("@/AppComponents/Charts/LogsAlertsChart"));
const TopIPSourcesTable = React.lazy(() => import("@/AppComponents/Table/TopIPSourcesTable"));
const AlertsTable = React.lazy(() => import("@/AppComponents/Table/AlertsTable"));
const LogsTable = React.lazy(() => import("@/AppComponents/Table/LogsTable"));

// Debounce hook
function useDebouncedCallback<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  const ref = React.useRef<{ timeout?: number | NodeJS.Timeout; fn: T }>({ fn });
  useEffect(() => { ref.current.fn = fn; }, [fn]);
  return useCallback((...args: Parameters<T>) => {
    if (ref.current.timeout) clearTimeout(ref.current.timeout as any);
    ref.current.timeout = setTimeout(() => ref.current.fn(...args), delay);
  }, [delay]);
}

const Dashboard: React.FC = () => {
  useFilterSearchParams();
  const filters = useFilterStore();
  const { user } = useUserStore();

  const { data: summaryData, isLoading: summaryLoading } = useSummaryQuery();
  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useLogsQuery();
  const { data: logsAlertsData, isLoading: logsAlertsLoading } = useLogsAlertsQuery();
  const { data: topIPsData, isLoading: topIPsLoading } = useTopIPsQuery();
  const { data: alertsData, isLoading: alertsLoading } = useRecentAlertsQuery();

  const handleReset = useCallback(() => {
    filters.reset();
    if (user) filters.initializeTenant(user.role, user.tenant);
  }, [filters, user]);

  const handleDeleteAlerts = useCallback(async (id: string) => await deleteAlert(id), []);
   const handleDeleteLogs = useCallback(async (id: string) => await deleteLog(id), []);
  const handleResolveAlerts = useCallback(async (id: string) => await resolveAlert(id), []);
  const debouncedRefetchLogs = useDebouncedCallback(() => refetchLogs?.(), 300);

  // Check if *any* of the main queries are still loading
  const isLoading = summaryLoading || logsLoading || logsAlertsLoading || topIPsLoading || alertsLoading;

  // Initialize filters based on user
  useEffect(() => {
    if (user) filters.initializeTenant(user.role, user.tenant);
  }, [user, filters]);

  // --- ✅ Main conditional render ---
  if (isLoading) {
    return <LoadingScreen />;
  }

  // --- ✅ Once everything is ready ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 px-6">
      <div className="max-w-full mx-auto">
        <Suspense fallback={<LoadingScreen />}>
          {logsAlertsData && <LogsAlertsTrendChart rawData={logsAlertsData} />}
          {summaryData && <SummaryChart data={summaryData.data} />}
          {topIPsData && <TopIPSourcesTable data={topIPsData} />}
          {alertsData && (
            <AlertsTable
              data={alertsData}
              desc="Recent"
              userRole={user?.role}
              onDeleteAlert={handleDeleteAlerts}
              onResolveAlert={handleResolveAlerts}
            />
          )}

          {/* Logs Table Section */}
          <Card className="p-6 mt-6 mb-6">
            <CardHeader className="flex mb-6 justify-between items-center">
              <h1 className="text-xl font-bold">Log Details</h1>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
                  <FilterX className="h-4 w-4" />
                  Clear Filters
                </Button>
                <Button onClick={() => debouncedRefetchLogs()} disabled={logsLoading} className="flex items-center gap-2">
                  <RefreshCw className={`h-4 w-4 ${logsLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Action</label>
                <ActionFilter value={filters.action} onValueChange={filters.setAction} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Source</label>
                <SourceFilter value={filters.source} onValueChange={filters.setSource} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date Range</label>
                <DateFilter value={filters.date} onValueChange={filters.setDate} />
              </div>

              <div className="md:col-span-2 lg:col-span-4 xl:col-span-1">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Search Keywords</label>
                <SearchBar value={filters.keyword} onValueChange={filters.setKeyword} />
              </div>
            </div>

            {logsData && <LogsTable userRole={user?.role} logs={logsData.data} onDeleteLog={handleDeleteLogs} />}
          </Card>
        </Suspense>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
