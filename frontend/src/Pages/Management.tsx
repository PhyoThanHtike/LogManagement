import CreateCards from "@/AppComponents/Charts/CreateCards";
import CreateLogDialog from "@/AppComponents/Dialogs/CreateLogDialog";
import { Button } from "@/components/ui/button";
import React from "react";
import { UserPlus, Activity, Siren } from "lucide-react";
import { createUser } from "@/apiEndpoints/User";
import { createAlertRule, deleteAlertRule, updateAlertRule } from "@/apiEndpoints/Alert";
import { CreateDialog } from "@/AppComponents/Dialogs/CreateDialog";
import { AlertRulesTable } from "@/AppComponents/Table/AlertRuleTable";
import { useAlertRulesQuery } from "@/hooks/useCustomQuery";

const Management = () => {
  const handleCreateUser = async (userData: any) => {
    return await createUser(userData);
  };

  const handleCreateAlertRule = async (alertRuleData: any) => {
    return await createAlertRule(alertRuleData);
  };

  const handleDeleteAlertRule = async(ruleId:string)=> {
    return await deleteAlertRule(ruleId);
  }

  const handleUpdateAlertRule = async(id:string, updateData:any)=>{
    return await updateAlertRule(id, updateData);
  }

  const {data: alertRuleData, isLoading: alertRuleLoading} = useAlertRulesQuery();
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
            trigger={<CreateCards label="Users" color="green" icon={UserPlus} />}
          />

          <CreateDialog
            mode="create-alert-rule"
            handleCreateAlertRule={handleCreateAlertRule}
            trigger={<CreateCards label="Alert Rules" color="red" icon={Siren} />}
          />
        </div>

        <div>
            <AlertRulesTable data={alertRuleData} userRole="ADMIN" onDeleteRule={handleDeleteAlertRule} onUpdateRule={handleUpdateAlertRule} />
        </div>
      </div>
    </>
  );
};

export default Management;
