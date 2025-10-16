import type { TopIPsAndSourcesData } from "@/apiEndpoints/Logs";
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

    const TopIPSourcesTable: React.FC<{ data: any }> = ({ data }) => {
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
            <CardTitle className="text-xl">Top IPs</CardTitle>
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
                {data.topIPs.map((item:any, index:any) => (
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
            <CardTitle className="text-xl">Top Sources</CardTitle>
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
                {data.topSources.map((item:any) => (
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
            <CardTitle className="text-xl">Top Actions</CardTitle>
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
                {data.topActions.map((item:any) => (
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

export default TopIPSourcesTable;

