// src/components/Dashboard.tsx
import { useFilterStore } from "@/store/FilterStore";
import { useFilterSearchParams } from "@/hooks/useSearchParams";
import { useLogsQuery } from "@/hooks/useLogsQuery";
import { useSummaryQuery } from "@/hooks/useSummary";
import ActionFilter from "@/AppComponents/Dropdowns/ActionFilter";
import SourceFilter from "@/AppComponents/Dropdowns/SourceFilter";
// import DateFilter from "@/AppComponents/Dropdowns/ActionFilter";/
import SearchBar from "@/AppComponents/Dropdowns/SearchBar";
import { Button } from "@/components/ui/button";
import { RefreshCw, FilterX } from "lucide-react";
import { useUserStore } from "@/store/UserStore";
import { useEffect } from "react";
import TenantFilter from "@/AppComponents/Dropdowns/TenantFilter";
import SummaryChart from "@/AppComponents/Charts/SummaryChart";
import DateFilter from "@/AppComponents/Dropdowns/DateFilter";
import LogsTable from "@/AppComponents/Table/LogsTable";
import { Card, CardHeader } from "@/components/ui/card";

const Dashboard = () => {
  // Initialize search params synchronization
  useFilterSearchParams();

  useFilterSearchParams();

  const filters = useFilterStore();
  const { user } = useUserStore();
  const { data: summaryData, isLoading: summaryLoading } = useSummaryQuery();
  const {
    data: logsData,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useLogsQuery();

  // Initialize tenant based on user role when component mounts
  useEffect(() => {
    if (user) {
      filters.initializeTenant(user.role, user.tenant);
    }
  }, [user, filters]); // Add filters to dependencies

  const handleReset = () => {
    filters.reset();
    // Re-initialize tenant after reset based on current user
    if (user) {
      filters.initializeTenant(user.role, user.tenant);
    }
  };

  const isLoading = summaryLoading || logsLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6">
      <div className="max-w-full mx-auto">
        {/* <SummaryChart data={summaryData.data}/> */}
        <div>
          {summaryLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : (
            summaryData && (
              <div className="space-y-3">
                <SummaryChart data={summaryData.data} />
              </div>
            )
          )}
        </div>

        {/* Table Section */}
        <Card className="p-6 mb-6">
          <CardHeader className="flex mb-6 justify-between items center">
            <h1 className="text-xl font-bold">Log Details</h1>
            {/* Action Buttons */}
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
                onClick={() => refetchLogs()}
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
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action
              </label>
              <ActionFilter
                value={filters.action}
                onValueChange={filters.setAction}
              />
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source
              </label>
              <SourceFilter
                value={filters.source}
                onValueChange={filters.setSource}
              />
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <DateFilter
                value={filters.date}
                onValueChange={filters.setDate}
              />
            </div>

            {/* Search Bar */}
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
                ></div>
              ))}
            </div>
          ) : (
            logsData && <LogsTable userRole={user?.role} logs={logsData.data} />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
