import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  AlertCircle,
  Info,
  TriangleAlert,
  Bug,
  Shield,
  ShieldAlert,
  Plus,
  Pencil,
  LogIn,
  ShieldX,
  Ban,
} from "lucide-react";
import CustomAlertDialog from "../Dialogs/CustomAlertDialog";
import { toast } from "sonner";
import { invalidateLogsAlerts } from "@/query/queryClient";

// Types
interface Log {
  id: string;
  timestamp: string;
  tenant: string;
  source: string;
  eventType: string;
  severity: number | null;
  srcIp: string | null;
  user: string | null;
  action: string | null;
  createdAt: string;
}

interface LogsTableProps {
  logs: Log[];
  currentTenant: string;
  userRole: any;
  onDeleteLog?: (
    logId: string
  ) => Promise<{ success: boolean; message?: string } | void> | void;
  isLoading?: boolean;
}

interface LogsResponse {
  message: string;
  hasNextPage: boolean;
  nextCursor: string;
  data: Log[];
}

// Action configuration
const ACTION_CONFIG = {
  ALLOW: {
    variant: "success" as const,
    icon: Shield,
    label: "Allow",
  },
  DENY: {
    variant: "destructive" as const,
    icon: ShieldAlert,
    label: "Deny",
  },
  CREATE: {
    variant: "info" as const,
    icon: Plus,
    label: "Create",
  },
  DELETE: {
    variant: "destructive" as const,
    icon: Trash2,
    label: "Delete",
  },
  UPDATE: {
    variant: "warning" as const,
    icon: Pencil,
    label: "Update",
  },
  ALERT: {
    variant: "destructive" as const,
    icon: AlertCircle,
    label: "Alert",
  },
  LOGIN: {
    variant: "success" as const,
    icon: LogIn,
    label: "Login",
  },
  QUARANTINE: {
    variant: "warning" as const,
    icon: ShieldX,
    label: "Quarantine",
  },
  BLOCK: {
    variant: "critical" as const,
    icon: Ban,
    label: "Block",
  },
};

// Severity configuration
const SEVERITY_RANGES = [
  {
    range: [0, 2],
    label: "Informational",
    severity: "0-2",
    icon: Info,
    variant: "default" as const,
  },
  {
    range: [3, 5],
    label: "Warning",
    severity: "3-5",
    icon: TriangleAlert,
    variant: "warning" as const,
  },
  {
    range: [6, 7],
    label: "Debug",
    severity: "6-7",
    icon: Bug,
    variant: "critical" as const,
  },
  {
    range: [8, 10],
    label: "Alert",
    severity: "8-10",
    icon: AlertCircle,
    variant: "destructive" as const,
  },
];

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getSeverityConfig = (severity: number | null) => {
  if (severity === null) {
    return {
      label: "N/A",
      severity: "",
      variant: "outline" as const,
      icon: Info,
    };
  }

  const config = SEVERITY_RANGES.find(
    ({ range }) => severity >= range[0] && severity <= range[1]
  );

  return (
    config || {
      label: "Unknown",
      severity: "",
      variant: "outline" as const,
      icon: Info,
    }
  );
};

const getActionConfig = (action: string | null) => {
  if (!action) return null;

  return (
    ACTION_CONFIG[action as keyof typeof ACTION_CONFIG] || {
      variant: "outline" as const,
      icon: Info,
      label: action,
    }
  );
};

const LogsTable = ({
  logs,
  currentTenant,
  userRole,
  onDeleteLog,
  isLoading = false,
}: LogsTableProps) => {
  // const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

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
  const columns = [
    { key: "date", label: "Date" },
    { key: "user", label: "User" },
    { key: "srcIp", label: "IP Address" },
    { key: "source", label: "Source" },
    { key: "eventType", label: "Event" },
    { key: "severity", label: "Severity" },
    { key: "action", label: "Action" },
    ...(userRole === "ADMIN" ? [{ key: "activity", label: "Activity" }] : []),
  ];

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className=""
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  No logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => {
                const severityConfig = getSeverityConfig(log.severity);
                const SeverityIcon = severityConfig.icon;
                const actionConfig = getActionConfig(log.action);
                const ActionIcon = actionConfig?.icon;

                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TableCell className="font-medium">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      {log.user || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.srcIp || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {log.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.eventType}
                    </TableCell>
                    <TableCell>
                      {log.severity !== null ? (
                        <Badge
                          variant={severityConfig.variant}
                          className="gap-1"
                        >
                          <SeverityIcon className="h-3 w-3" />
                          {severityConfig.label} ({severityConfig.severity})
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {actionConfig ? (
                        <Badge variant={actionConfig.variant} className="gap-1">
                          {ActionIcon && <ActionIcon className="h-3 w-3" />}
                          {actionConfig.label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    {userRole === "ADMIN" && (
                      <TableCell>
                        <CustomAlertDialog
                          trigger={
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Delete Log?"
                          description="This will permanently delete the log. This action cannot be undone."
                          confirmText="Delete"
                          cancelText="Cancel"
                          onDelete={async () => {
                            if (!onDeleteLog) {
                              toast.error(
                                "No handler provided for deleting logs"
                              );
                              return;
                            }
                            try {
                              const res = await onDeleteLog(log.id);
                              handleResultToasts(
                                res,
                                "Log deleted",
                                "Failed to delete Log"
                              );
                              await invalidateLogsAlerts(currentTenant);
                            } catch (err: any) {
                              toast.error(
                                err?.message || "Failed to delete log"
                              );
                              throw err;
                            }
                          }}
                        />
                      </TableCell>
                    )}
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default LogsTable;
export type { Log, LogsResponse, LogsTableProps };
