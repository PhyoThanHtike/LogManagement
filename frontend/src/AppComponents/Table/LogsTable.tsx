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
import { Input } from "@/components/ui/input"; // Add this import
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
  Search,
  X, // Add this import
} from "lucide-react";
import CustomAlertDialog from "../Dialogs/CustomAlertDialog";
import { toast } from "sonner";
import { invalidateLogsAlerts } from "@/query/queryClient";
import { useState, useMemo, useCallback, useEffect } from "react";

// Types (keep your existing types the same)
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

// Action configuration (keep your existing config)
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

// Severity configuration (keep your existing config)
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

// Utility functions (keep your existing functions)
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

// Constants for pagination
const INITIAL_ROWS = 10;
const LOAD_MORE_ROWS = 5;

const LogsTable = ({
  logs,
  currentTenant,
  userRole,
  onDeleteLog,
  isLoading = false,
}: LogsTableProps) => {
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);
  const [searchQuery, setSearchQuery] = useState("");

  // Reset visible rows and search when logs change
  useEffect(() => {
    setVisibleRows(INITIAL_ROWS);
    setSearchQuery("");
  }, [logs]);

  // Filter logs based on search query
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;

    const query = searchQuery.toLowerCase().trim();
    return logs.filter((log) => {
      return (
        log.timestamp.toLowerCase().includes(query) ||
        log.tenant.toLowerCase().includes(query) ||
        (log.user && log.user.toLowerCase().includes(query)) ||
        (log.srcIp && log.srcIp.toLowerCase().includes(query)) ||
        log.source.toLowerCase().includes(query) ||
        log.eventType.toLowerCase().includes(query) ||
        (log.action && log.action.toLowerCase().includes(query)) ||
        (log.severity !== null && log.severity.toString().includes(query))
      );
    });
  }, [logs, searchQuery]);

  // Memoize the visible logs to prevent unnecessary recalculations
  const visibleLogs = useMemo(() => {
    return filteredLogs.slice(0, visibleRows);
  }, [filteredLogs, visibleRows]);

  // Check if there are more logs to load
  const hasMoreLogs = useMemo(() => {
    return visibleRows < filteredLogs.length;
  }, [visibleRows, filteredLogs.length]);

  // Handle loading more rows
  const handleLoadMore = useCallback(() => {
    setVisibleRows(prev => prev + LOAD_MORE_ROWS);
  }, []);

  // Clear search query
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleResultToasts = useCallback((
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
  }, []);

  // Memoize columns configuration
  const columns = useMemo(() => [
    { key: "date", label: "Date" },
    { key: "tenant", label: "Tenant" },
    { key: "user", label: "User" },
    { key: "srcIp", label: "IP Address" },
    { key: "source", label: "Source" },
    { key: "eventType", label: "Event" },
    { key: "severity", label: "Severity" },
    { key: "action", label: "Action" },
    ...(userRole === "ADMIN" ? [{ key: "activity", label: "Activity" }] : []),
  ], [userRole]);

  // Loading state
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
      {/* Search Bar */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 dark:bg-gray-700"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-sm text-muted-foreground"
        >
          Found {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''} matching "{searchQuery}"
          {filteredLogs.length === 0 && (
            <Button
              variant="link"
              onClick={handleClearSearch}
              className="h-auto p-0 ml-2 text-blue-500"
            >
              Clear search
            </Button>
          )}
        </motion.div>
      )}

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
            {visibleLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchQuery ? 'No logs found matching your search' : 'No logs found'}
                </TableCell>
              </TableRow>
            ) : (
              visibleLogs.map((log, index) => {
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
                    <TableCell className="font-medium py-6">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {log.tenant}
                      </Badge>
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

      {/* Load More Button */}
      {hasMoreLogs && (
        <motion.div 
          className="flex justify-center mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="px-6"
          >
            View More ({filteredLogs.length - visibleRows} remaining)
          </Button>
        </motion.div>
      )}

      {/* Show message when all logs are loaded */}
      {!hasMoreLogs && filteredLogs.length > INITIAL_ROWS && (
        <motion.div 
          className="text-center mt-4 text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          All logs loaded ({filteredLogs.length} total)
          {searchQuery && ` matching "${searchQuery}"`}
        </motion.div>
      )}
    </motion.div>
  );
};

export default LogsTable;
export type { Log, LogsResponse, LogsTableProps };