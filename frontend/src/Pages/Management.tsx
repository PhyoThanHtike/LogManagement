import CreateCards from "@/AppComponents/Charts/CreateCards";
import CreateLogDialog from "@/AppComponents/Dialogs/CreateLogDialog";
import { UserPlus, Activity, Siren } from "lucide-react";
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
import { CreateDialog } from "@/AppComponents/Dialogs/CreateDialog";
import { AlertRulesTable } from "@/AppComponents/Table/AlertRuleTable";
import {
  useAlertRulesQuery,
  useAllAlertsQuery,
  useAllUsersQuery,
} from "@/hooks/useCustomQuery";
import AlertsTable from "@/AppComponents/Table/AlertsTable";
import { UserTable } from "@/AppComponents/Table/UserTable";

const Management = () => {
  const handleCreateUser = async (userData: any) => {
    return await createUser(userData);
  };

  const handleCreateAlertRule = async (alertRuleData: any) => {
    return await createAlertRule(alertRuleData);
  };

  const handleDeleteAlertRule = async (ruleId: string) => {
    return await deleteAlertRule(ruleId);
  };
  const handleDeleteUser = async (userId: string) => {
    return await deleteUser(userId);
  };
  const handleUpdateUser = async (userId: string, userData: any) => {
    return await updateUser(userId, userData);
  };

  const handleRestrictToggle = async (userId: string) => {
    return await toggleRestrictUser(userId);
  };

  const handleDeleteAlerts = async (alertId: string) => {
    return await deleteAlert(alertId);
  };

  const handleResolveAlerts = async (alertId: string) => {
    return await resolveAlert(alertId);
  };

  const handleUpdateAlertRule = async (id: string, updateData: any) => {
    return await updateAlertRule(id, updateData);
  };

  const { data: alertRuleData, isLoading: alertRuleLoading } =
    useAlertRulesQuery();

  const { data: allAlertsData, isLoading: allAlertsLoading } =
    useAllAlertsQuery();

  const { data: allUsersData, isLoading: allUsersLoading } = useAllUsersQuery();
  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
          <CreateLogDialog
            trigger={<CreateCards label="Logs" color="blue" icon={Activity} />}
          />
          <CreateDialog
            mode="create-user"
            handleCreateUser={handleCreateUser}
            trigger={
              <CreateCards label="Users" color="green" icon={UserPlus} />
            }
          />

          <CreateDialog
            mode="create-alert-rule"
            handleCreateAlertRule={handleCreateAlertRule}
            trigger={
              <CreateCards label="Alert Rules" color="red" icon={Siren} />
            }
          />
        </div>

        <div>
          {!alertRuleLoading && (
            <AlertRulesTable
              data={alertRuleData}
              userRole="ADMIN"
              onDeleteRule={handleDeleteAlertRule}
              onUpdateRule={handleUpdateAlertRule}
            />
          )}
        </div>
        {!allAlertsLoading && (
          <AlertsTable
            data={allAlertsData}
            desc="All"
            userRole="ADMIN"
            onDeleteAlert={handleDeleteAlerts}
            onResolveAlert={handleResolveAlerts}
          />
        )}

        {!allUsersLoading && (
          <UserTable
            data={allUsersData}
            onDeleteUser={handleDeleteUser}
            onToggleUserStatus={handleRestrictToggle}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </div>
    </>
  );
};

export default Management;
