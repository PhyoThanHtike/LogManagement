// src/AppComponents/Table/AlertRuleTable.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import CreateLogDialog from "../Dialogs/CreateLogDialog";
// use the CreateDialog for editing alert rules
import { CreateDialog } from "@/AppComponents/Dialogs/CreateDialog";
import CustomAlertDialog from "../Dialogs/CustomAlertDialog";
import { toast } from "sonner";

interface AlertRule {
  id: string;
  tenant: string;
  ruleName: string;
  logSource: string;
  severity: number;
  isActive: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface AlertRulesResponse {
  success: boolean;
  alertRules: AlertRule[];
}

interface AlertRulesTableProps {
  data?: AlertRulesResponse | null;
  userRole: "ADMIN" | "USER";
  // Make these return Promise-like results to match how CreateDialog expects handlers,
  // but we still guard and wrap when calling.
  onUpdateRule?: (ruleId: string, updateData: any) => Promise<{ success: boolean; message?: string } | void>;
  onDeleteRule?: (ruleId: string) => Promise<void> | void;
}

const getSeverityColor = (severity: number) => {
  if (severity >= 9) return "bg-red-100 text-red-800 border-red-200";
  if (severity >= 7) return "bg-orange-100 text-orange-800 border-orange-200";
  if (severity >= 5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-blue-100 text-blue-800 border-blue-200";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function AlertRulesTable({
  data,
  userRole,
  onUpdateRule,
  onDeleteRule,
}: AlertRulesTableProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const rules = data?.alertRules ?? [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Alert Rules</CardTitle>
          <CardDescription>Manage and monitor your security alert rules</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                {userRole === "ADMIN" && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{rule.ruleName}</div>
                      <div className="text-sm text-muted-foreground mt-1">{rule.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {rule.logSource}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{rule.tenant}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(rule.severity)}>{rule.severity}/10</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(rule.createdAt)}</TableCell>

                  {userRole === "ADMIN" && (
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {/* EDIT: use CreateDialog in update mode. Pass initialData and a wrapper handleUpdateAlertRule */}
                        <CreateDialog
                          mode="update-alert-rule"
                          trigger={
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                          alertRuleId={rule.id}
                          initialData={{
                            tenant: rule.tenant,
                            ruleName: rule.ruleName,
                            logSource: rule.logSource,
                            severity: rule.severity,
                            description: rule.description,
                          }}
                          // wrap the provided onUpdateRule to the handler signature CreateDialog expects
                          handleUpdateAlertRule={async (id: string, updateData: any) => {
                            if (!onUpdateRule) return { success: false, message: "No update handler" };
                            const res = await onUpdateRule(id, updateData);
                            // If onUpdateRule returns void, treat as success
                            if (res === undefined) return { success: true };
                            return res as { success: boolean; message?: string };
                          }}
                        />

                        {/* DELETE: use CustomAlertDialog with a callback (do NOT call the function immediately) */}
                        <CustomAlertDialog
                          trigger={
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          description="You are going to delete an Alert rule."
                          // pass callback, do not call onDeleteRule immediately
                          onDelete={async () => {
                            if (!onDeleteRule) return;
                            await onDeleteRule(rule.id);
                            toast.success(`${rule.ruleName} deleted successfully`);
                          }}
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
