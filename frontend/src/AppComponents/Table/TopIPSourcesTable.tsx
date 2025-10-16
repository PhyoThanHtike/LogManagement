import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";

interface TopIP {
  ip: string;
  count: number;
}

interface TopSource {
  source: string;
  count: number;
}

interface TopAction {
  action: string;
  count: number;
}

interface DataResponse {
  success: boolean;
  message: string;
  data: {
    topIPs: TopIP[];
    topSources: TopSource[];
    topActions: TopAction[];
  };
}

const data: DataResponse = {
  "success": true,
  "message": "Top IPs and sources retrieved successfully",
  "data": {
    "topIPs": [
      {
        "ip": "10.0.1.10",
        "count": 2
      },
      {
        "ip": "10.0.2.200",
        "count": 1
      },
      {
        "ip": "203.0.113.85",
        "count": 1
      },
      {
        "ip": "203.0.113.45",
        "count": 1
      },
      {
        "ip": "10.1.3.33",
        "count": 1
      },
      {
        "ip": "192.168.10.24",
        "count": 1
      },
      {
        "ip": "10.0.3.15",
        "count": 1
      }
    ],
    "topSources": [
      {
        "source": "FIREWALL",
        "count": 5
      },
      {
        "source": "API",
        "count": 4
      },
      {
        "source": "AD",
        "count": 3
      },
      {
        "source": "CROWDSTRIKE",
        "count": 2
      },
      {
        "source": "NETWORK",
        "count": 2
      },
      {
        "source": "M365",
        "count": 2
      },
      {
        "source": "AWS",
        "count": 1
      }
    ],
    "topActions": [
      {
        "action": "DENY",
        "count": 5
      },
      {
        "action": "ALERT",
        "count": 5
      },
      {
        "action": "BLOCK",
        "count": 4
      },
      {
        "action": "QUARANTINE",
        "count": 2
      },
      {
        "action": "ALLOW",
        "count": 1
      },
      {
        "action": "LOGIN",
        "count": 1
      }
    ]
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export function TopIPSourcesTable() {
  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top IPs Table */}
      <motion.div variants={itemVariants} className="flex">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Top IPs</CardTitle>
            <CardDescription>
              Most active IP addresses by event count
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.topIPs.map((item, index) => (
                  <TableRow key={item.ip}>
                    <TableCell className="font-mono">{item.ip}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Sources Table */}
      <motion.div variants={itemVariants} className="flex">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Top Sources</CardTitle>
            <CardDescription>
              Event sources by occurrence count
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.topSources.map((item) => (
                  <TableRow key={item.source}>
                    <TableCell className="font-medium">{item.source}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Actions Table */}
      <motion.div variants={itemVariants} className="flex">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Top Actions</CardTitle>
            <CardDescription>
              Most common actions taken
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.topActions.map((item) => (
                  <TableRow key={item.action}>
                    <TableCell className="font-medium">{item.action}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}