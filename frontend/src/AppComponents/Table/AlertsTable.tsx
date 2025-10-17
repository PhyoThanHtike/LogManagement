// src/AppComponents/Table/AlertsTable.tsx
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
import { CheckCircle, Trash2 } from "lucide-react";
import CustomAlertDialog from "@/AppComponents/Dialogs/CustomAlertDialog";
import { toast } from "sonner";
import { invalidateAlerts } from "@/query/queryClient";

interface Alert {
  id: string;
  tenant: string;
  alertRuleId: string;
  logId: string;
  ruleName: string;
  severity: number;
  description: string;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  userId: string | null;
}

interface AlertsResponse {
  success: boolean;
  data: Alert[];
}

interface AlertsTableProps {
  data?: AlertsResponse | null;
  currentTenant: string;
  userRole: any;
  desc: string;
  // Handlers may return a promise that resolves to { success: boolean; message?: string } or void
  onResolveAlert?: (
    alertId: string
  ) => Promise<{ success: boolean; message?: string } | void> | void;
  onDeleteAlert?: (
    alertId: string
  ) => Promise<{ success: boolean; message?: string } | void> | void;
}

const getSeverityColor = (severity: number) => {
  if (severity >= 9) return "bg-red-100 text-red-800 border-red-200";
  if (severity >= 7) return "bg-orange-100 text-orange-800 border-orange-200";
  if (severity >= 5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-blue-100 text-blue-800 border-blue-200";
};

const getStatusVariant = (isResolved: boolean) => {
  return isResolved ? "default" : "destructive";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AlertsTable: React.FC<AlertsTableProps> = ({
  data,
  currentTenant,
  userRole,
  desc,
  onResolveAlert,
  onDeleteAlert,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const alerts = data?.data ?? [];

  // helper to process handler result and show toasts
  const handleResultToasts = (
    result: any,
    successMsg: string,
    failMsgFallback: string
  ) => {
    // if handler returned nothing => assume success
    if (result === undefined) {
      toast.success(successMsg);
      return;
    }

    // if handler returned shape { success, message }
    if (typeof result === "object" && "success" in result) {
      if (result.success) {
        toast.success(result.message || successMsg);
      } else {
        toast.error(result.message || failMsgFallback);
      }
      return;
    }

    // otherwise unknown return value -> treat as success
    toast.success(successMsg);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{desc} Security Alerts</CardTitle>
          <CardDescription>
            Recent security alerts and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                {userRole === "ADMIN" && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">
                    {alert.ruleName}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">{alert.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{alert.tenant}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}/10
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(alert.isResolved)}>
                      {alert.isResolved ? "Resolved" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(alert.createdAt)}
                  </TableCell>

                  {userRole === "ADMIN" && (
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {/* Resolve action: show confirm dialog, call onResolveAlert when confirmed */}
                        {!alert.isResolved && (
                          <CustomAlertDialog
                            trigger={
                              <Button variant="outline" size="sm">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            }
                            title="Resolve alert?"
                            description="Are you sure you want to mark this alert as resolved?"
                            confirmText="Resolve"
                            cancelText="Cancel"
                            onConfirm={async () => {
                              if (!onResolveAlert) {
                                toast.error(
                                  "No handler provided for resolving alerts"
                                );
                                return;
                              }
                              try {
                                const res = await onResolveAlert(alert.id);
                                handleResultToasts(
                                  res,
                                  "Alert resolved",
                                  "Failed to resolve alert"
                                );
                              } catch (err: any) {
                                toast.error(
                                  err?.message || "Failed to resolve alert"
                                );
                                // rethrow if parent wants to handle it too
                                throw err;
                              }
                            }}
                          />
                        )}

                        {/* Delete action: show confirm dialog, call onDeleteAlert when confirmed */}
                        <CustomAlertDialog
                          trigger={
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Delete alert?"
                          description="This will permanently delete the alert. This action cannot be undone."
                          confirmText="Delete"
                          cancelText="Cancel"
                          onDelete={async () => {
                            if (!onDeleteAlert) {
                              toast.error(
                                "No handler provided for deleting alerts"
                              );
                              return;
                            }
                            try {
                              const res = await onDeleteAlert(alert.id);
                              await invalidateAlerts(currentTenant);
                              handleResultToasts(
                                res,
                                "Alert deleted",
                                "Failed to delete alert"
                              );
                            } catch (err: any) {
                              toast.error(
                                err?.message || "Failed to delete alert"
                              );
                              throw err;
                            }
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

export default AlertsTable;