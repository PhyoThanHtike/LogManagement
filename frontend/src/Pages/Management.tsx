// src/pages/Management.tsx
import React, { Suspense, useCallback, useMemo } from "react";
import { useFilterStore } from "@/store/FilterStore";
import CreateCards from "@/AppComponents/Charts/CreateCards";
import CreateLogDialog from "@/AppComponents/Dialogs/CreateLogDialog";
import { CreateDialog } from "@/AppComponents/Dialogs/CreateDialog";
import { UserPlus, Activity, Siren, Code } from "lucide-react";
import LoadingScreen from "@/Layout/LoadingScreen";

// API Endpoints
import {
  createUser,
  deleteUser,
  toggleRestrictUser,
  updateUser,
} from "@/apiEndpoints/User";
import {
  createAlertRule,
  deleteAlert,
  deleteAlertRule,
  resolveAlert,
  updateAlertRule,
} from "@/apiEndpoints/Alert";

// Data Hooks
import {
  useAlertRulesQuery,
  useAllAlertsQuery,
  useAllUsersQuery,
} from "@/hooks/useCustomQuery";
import { CreateSyslog } from "@/AppComponents/Dialogs/CreateSyslog";

//  Lazy load heavy components
const AlertRulesTable = React.lazy(() => import("@/AppComponents/Table/AlertRuleTable"));
const AlertsTable = React.lazy(() => import("@/AppComponents/Table/AlertsTable"));
const UserTable = React.lazy(() => import("@/AppComponents/Table/UserTable"));

const Management: React.FC = () => {
  const filters = useFilterStore();

  //  Wrap API handlers in useCallback to prevent unnecessary re-renders
  const handleCreateUser = useCallback(async (userData: any) => await createUser(userData), []);
  const handleCreateAlertRule = useCallback(async (data: any) => await createAlertRule(data), []);
  const handleDeleteAlertRule = useCallback(async (id: string) => await deleteAlertRule(id), []);
  const handleUpdateAlertRule = useCallback(async (id: string, data: any) => await updateAlertRule(id, data), []);
  const handleDeleteUser = useCallback(async (id: string) => await deleteUser(id), []);
  const handleUpdateUser = useCallback(async (id: string, data: any) => await updateUser(id, data), []);
  const handleRestrictToggle = useCallback(async (id: string) => await toggleRestrictUser(id), []);
  const handleDeleteAlerts = useCallback(async (id: string) => await deleteAlert(id), []);
  const handleResolveAlerts = useCallback(async (id: string) => await resolveAlert(id), []);

  //  Queries
  const { data: alertRuleData, isLoading: alertRuleLoading } = useAlertRulesQuery();
  const { data: allAlertsData, isLoading: allAlertsLoading } = useAllAlertsQuery();
  const { data: allUsersData, isLoading: allUsersLoading } = useAllUsersQuery();

  //  Compute loading state once
  const isLoading = alertRuleLoading || allAlertsLoading || allUsersLoading;

  //  Memoize props passed to large tables
  const memoizedProps = useMemo(
    () => ({
      tenant: filters.tenant,
      role: "ADMIN" as const,
    }),
    [filters.tenant]
  );

  //  Conditional render
  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 px-6">
      {/* --- Create Cards Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
        <CreateLogDialog
          trigger={<CreateCards label="Logs" color="blue" icon={Activity} />}
        />
        <CreateSyslog currentTenant={filters.tenant} trigger={<CreateCards label="SysLogs" color="purple" icon={Code} />} />
        <CreateDialog
          currentTenant={filters.tenant}
          mode="create-user"
          handleCreateUser={handleCreateUser}
          trigger={<CreateCards label="Users" color="green" icon={UserPlus} />}
        />
        <CreateDialog
          currentTenant={filters.tenant}
          mode="create-alert-rule"
          handleCreateAlertRule={handleCreateAlertRule}
          trigger={<CreateCards label="Alert Rules" color="red" icon={Siren} />}
        />
      </div>

      {/* --- Data Tables --- */}
      <Suspense fallback={<LoadingScreen />}>
        {alertRuleData && (
          <AlertRulesTable
            currentTenant={memoizedProps.tenant}
            data={alertRuleData}
            userRole={memoizedProps.role}
            onDeleteRule={handleDeleteAlertRule}
            onUpdateRule={handleUpdateAlertRule}
          />
        )}

        {allAlertsData && (
          <AlertsTable
            currentTenant={memoizedProps.tenant}
            data={allAlertsData}
            desc="All"
            userRole={memoizedProps.role}
            onDeleteAlert={handleDeleteAlerts}
            onResolveAlert={handleResolveAlerts}
          />
        )}

        {allUsersData && (
          <UserTable
            currentTenant={memoizedProps.tenant}
            data={allUsersData}
            onDeleteUser={handleDeleteUser}
            onToggleUserStatus={handleRestrictToggle}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </Suspense>
    </div>
  );
};

export default React.memo(Management);
