// src/AppComponents/Table/UserTable.tsx
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Edit, Trash2, Ban, UserCheck, Search } from "lucide-react";
import { CreateDialog } from "@/AppComponents/Dialogs/CreateDialog";
import CustomAlertDialog from "../Dialogs/CustomAlertDialog";
import { toast } from "sonner";
import { useMemo, useState, memo } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  status: any;
  tenant: string;
  createdAt: string;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  count: number;
}

interface UserTableProps {
  data?: UsersResponse | null;
  onUpdateUser?: (
    userId: string,
    updateData: any
  ) => Promise<{ success: boolean; message?: string } | void>;
  onDeleteUser?: (userId: string) => Promise<void> | void;
  onToggleUserStatus?: (userId: string) => Promise<void> | void;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "FREEZED":
      return "secondary";
    case "RESTRICTED":
      return "destructive";
    default:
      return "secondary";
  }
};

const getRoleVariant = (role: string) => {
  return role === "ADMIN" ? "default" : "outline";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function UserTableComponent({
  data,
  onUpdateUser,
  onDeleteUser,
  onToggleUserStatus,
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const filteredUsers = useMemo(() => {
    const users = data?.data ?? [];

    return users.filter((user) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.tenant.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      // Role filter
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [data, searchTerm, statusFilter, roleFilter]);

  const handleStatusToggle = async (
    userId: string,
    userName: string,
    currentStatus: string
  ) => {
    if (!onToggleUserStatus) return;

    try {
      await onToggleUserStatus(userId);
      const newStatus = currentStatus === "ACTIVE" ? "RESTRICTED" : "ACTIVE";
      toast.success(`${userName} status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const getStatusToggleDescription = (
    userName: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === "ACTIVE" ? "RESTRICTED" : "ACTIVE";
    return `You are about to ${
      currentStatus === "ACTIVE" ? "restrict" : "activate"
    } ${userName}. The user's status will be changed from ${currentStatus} to ${newStatus}.`;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mt-6 pb-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Users</CardTitle>
              <CardDescription>Manage and monitor your users</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredUsers.length} of {data?.count || 0} users
              </span>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or tenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="RESTRICTED">Restricted</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.tenant}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>


                    <TableCell>
                      <div className="flex justify-end gap-2 items-center">
                        {/* Status Toggle Button with CustomAlertDialog */}
                        <CustomAlertDialog
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                user.status === "ACTIVE"
                                  ? "text-orange-600 hover:text-orange-700"
                                  : "text-green-600 hover:text-green-700"
                              }
                            >
                              {user.status === "ACTIVE" ? (
                                <Ban className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          }
                          title={
                            user.status === "ACTIVE"
                              ? "Restrict User"
                              : "Activate User"
                          }
                          description={getStatusToggleDescription(
                            user.name,
                            user.status
                          )}
                          confirmText={
                            user.status === "ACTIVE" ? "Restrict" : "Activate"
                          }
                          onConfirm={async () => {
                            await handleStatusToggle(
                              user.id,
                              user.name,
                              user.status
                            );
                          }}
                        />

                        {/* EDIT: use CreateDialog in update mode */}
                        <CreateDialog
                          mode="update-user"
                          trigger={
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                          userId={user.id}
                          initialData={{
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            tenant: user.tenant,
                          }}
                          handleUpdateUser={async (
                            id: string,
                            updateData: any
                          ) => {
                            if (!onUpdateUser)
                              return {
                                success: false,
                                message: "No update handler",
                              };
                            const res = await onUpdateUser(id, updateData);
                            if (res === undefined) return { success: true };
                            return res as {
                              success: boolean;
                              message?: string;
                            };
                          }}
                        />

                        {/* DELETE: use CustomAlertDialog */}
                        <CustomAlertDialog
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Delete User"
                          description="You are going to delete a user. This action cannot be undone."
                          confirmText="Delete"
                          onConfirm={async () => {
                            if (!onDeleteUser) return;
                            await onDeleteUser(user.id);
                            toast.success(`${user.name} deleted successfully`);
                          }}
                        />
                      </div>
                    </TableCell>
                </TableRow>
              ))}

              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8"
                  >
                    <div className="text-muted-foreground">
                      No users found matching your filters.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const UserTable = memo(UserTableComponent);
