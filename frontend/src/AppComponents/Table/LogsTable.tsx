import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertCircle, Info, TriangleAlert, Bug } from 'lucide-react';

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
  userRole: any;
  onDeleteLog?: (logId: string) => void;
  isLoading?: boolean;
}

interface LogsResponse {
  message: string;
  hasNextPage: boolean;
  nextCursor: string;
  data: Log[];
}

// Severity configuration
const SEVERITY_RANGES = [
  { range: [0, 2], label: "Informational (0-2)", icon: Info, variant: "default" as const },
  { range: [3, 5], label: "Warning (3-5)", icon: TriangleAlert, variant: "secondary" as const },
  { range: [6, 7], label: "Debug (6-7)", icon: Bug, variant: "outline" as const },
  { range: [8, 10], label: "Alert (8-10)", icon: AlertCircle, variant: "destructive" as const },
];

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getSeverityConfig = (severity: number | null) => {
  if (severity === null) {
    return { label: 'N/A', variant: 'outline' as const, icon: Info };
  }
  
  const config = SEVERITY_RANGES.find(({ range }) => 
    severity >= range[0] && severity <= range[1]
  );
  
  return config || { label: 'Unknown', variant: 'outline' as const, icon: Info };
};

const LogsTable = ({ logs, userRole, onDeleteLog, isLoading = false }: LogsTableProps) => {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (logId: string) => {
    if (!onDeleteLog) return;
    
    setDeletingIds(prev => new Set(prev).add(logId));
    try {
      await onDeleteLog(logId);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(logId);
        return newSet;
      });
    }
  };

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'user', label: 'User' },
    { key: 'srcIp', label: 'IP Address' },
    { key: 'source', label: 'Source' },
    { key: 'eventType', label: 'Event' },
    { key: 'severity', label: 'Severity' },
    { key: 'action', label: 'Action' },
    ...(userRole === 'ADMIN' ? [{ key: 'activity', label: 'Activity' }] : []),
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
      className=''
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
                const IconComponent = severityConfig.icon;
                
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
                        <Badge variant={severityConfig.variant} className="gap-1">
                          <IconComponent className="h-3 w-3" />
                          {severityConfig.label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.action ? (
                        <Badge 
                          variant={
                            log.action === 'DENY' || log.action === 'QUARANTINE' 
                              ? 'destructive' 
                              : 'default'
                          }
                        >
                          {log.action}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    {userRole === 'ADMIN' && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingIds.has(log.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete log</span>
                        </Button>
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