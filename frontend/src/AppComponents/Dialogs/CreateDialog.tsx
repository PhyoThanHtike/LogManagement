import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import TenantDropdown from "../Dropdowns/TenantDropdown";
import SourceFilter from "../Dropdowns/SourceFilter";
import { toast } from "sonner";
import { invalidateAlertRules, invalidateUsers } from "@/query/queryClient";

export type DialogMode =
  | "create-user"
  | "update-user"
  | "create-alert-rule"
  | "update-alert-rule";

export interface BaseFormData {
  tenant: string;
}

export interface UserFormData extends BaseFormData {
  email: string;
  password?: string;
  name: string;
  role?: string;
}

export interface AlertRuleFormData extends BaseFormData {
  ruleName: string;
  logSource: string;
  severity: number;
  description?: string;
}

export type FormData = UserFormData | AlertRuleFormData;

interface CreateDialogProps {
  mode: DialogMode;
  trigger: React.ReactNode;
  currentTenant:string;
  userId?: string; // ✅ for user updates
  alertRuleId?: string; // ✅ for alert rule updates
  handleCreateUser?: (
    userData: UserFormData
  ) => Promise<{ success: boolean; message?: string }>;
  handleUpdateUser?: (
    id: string,
    userData: UserFormData
  ) => Promise<{ success: boolean; message?: string }>;
  handleCreateAlertRule?: (
    alertRuleData: AlertRuleFormData
  ) => Promise<{ success: boolean; message?: string }>;
  handleUpdateAlertRule?: (
    id: string,
    alertRuleData: AlertRuleFormData
  ) => Promise<{ success: boolean; message?: string }>;
  onSuccess?: () => void;
  initialData?: Partial<FormData>;
}

function getInitialFormData(
  mode: DialogMode,
  initialData: Partial<FormData>
): FormData {
  if (mode.includes("user")) {
    const data = initialData as Partial<UserFormData>;
    return {
      tenant: data.tenant ?? "TENANT1",
      email: data.email ?? "",
      password: data.password ?? "",
      name: data.name ?? "",
      role: data.role ?? "USER",
    };
  }

  const data = initialData as Partial<AlertRuleFormData>;
  return {
    tenant: data.tenant ?? "",
    ruleName: data.ruleName ?? "",
    logSource: data.logSource ?? "",
    severity: data.severity ?? 1,
    description: data.description ?? "",
  };
}

export const CreateDialog: React.FC<CreateDialogProps> = ({
  mode,
  currentTenant,
  trigger,
  userId,
  alertRuleId,
  handleCreateUser,
  handleUpdateUser,
  handleCreateAlertRule,
  handleUpdateAlertRule,
  onSuccess,
  initialData = {},
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(
    getInitialFormData(mode, initialData)
  );
  const [loading, setLoading] = useState(false);

  const initialFormData = useMemo(
    () => getInitialFormData(mode, initialData),
    [mode, JSON.stringify(initialData)]
  );

  useEffect(() => {
    if (open) setFormData(initialFormData);
  }, [open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tenant) {
      toast.error("Please select a tenant");
      return;
    }

    setLoading(true);
    try {
      let result: { success: boolean; message?: string };

      switch (mode) {
        case "create-user":
          if (!handleCreateUser) throw new Error("No handler provided");
          result = await handleCreateUser(formData as UserFormData);
          invalidateUsers(currentTenant);
          break;

        case "update-user":
          if (!handleUpdateUser || !userId)
            throw new Error("Missing userId or handler");
          result = await handleUpdateUser(userId, formData as UserFormData);
          invalidateUsers(currentTenant);
          break;

        case "create-alert-rule":
          if (!handleCreateAlertRule) throw new Error("No handler provided");
          result = await handleCreateAlertRule(formData as AlertRuleFormData);
          invalidateAlertRules(currentTenant);
          break;

        case "update-alert-rule":
          if (!handleUpdateAlertRule || !alertRuleId)
            throw new Error("Missing alertRuleId or handler");
          result = await handleUpdateAlertRule(
            alertRuleId,
            formData as AlertRuleFormData
          );
          invalidateAlertRules(currentTenant);
          break;

        default:
          throw new Error("Invalid mode");
      }

      if (result.success) {
        toast.success(getSuccessMessage(mode));
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(
          result.message ||
            `Failed to ${getActionLabel(mode)} ${getEntityName(mode)}`
        );
      }
    } catch (error: any) {
      toast.error(
        error.message ||
          `Failed to ${getActionLabel(mode)} ${getEntityName(mode)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const getDialogConfig = () => {
    switch (mode) {
      case "create-user":
        return { title: "Create User", description: "Add a new user" };
      case "update-user":
        return { title: "Update User", description: "Edit user details" };
      case "create-alert-rule":
        return { title: "Create Alert Rule", description: "Add a new rule" };
      case "update-alert-rule":
        return { title: "Update Alert Rule", description: "Edit rule details" };
      default:
        return { title: "", description: "" };
    }
  };

  const getActionLabel = (mode: DialogMode) =>
    mode.startsWith("create") ? "create" : "update";

  const getSuccessMessage = (mode: DialogMode) => {
    switch (mode) {
      case "create-user":
        return "User created successfully";
      case "update-user":
        return "User updated successfully";
      case "create-alert-rule":
        return "Alert rule created successfully";
      case "update-alert-rule":
        return "Alert rule updated successfully";
    }
  };

  const getEntityName = (mode: DialogMode) =>
    mode.includes("user") ? "user" : "alert rule";

  const { title, description } = getDialogConfig();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Field */}
          <div className="space-y-2">
            <Label htmlFor="tenant">Tenant *</Label>
            <TenantDropdown
              value={formData.tenant}
              onValueChange={(value) => handleInputChange("tenant", value)}
              disabled={loading}
            />
          </div>

          {/* User Form */}
          {mode.includes("user") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={(formData as UserFormData).role || "USER"}
                  onValueChange={(value) => handleInputChange("role", value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={(formData as UserFormData).name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={(formData as UserFormData).email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {mode === "create-user" && (
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password *{" "}
                    <span className="text-gray-400">
                      (at least 8 characters)
                    </span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={(formData as UserFormData).password || ""}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    disabled={loading}
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* Alert Rule Form */}
          {mode.includes("alert-rule") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="logSource">Log Source *</Label>
                <SourceFilter
                  value={(formData as AlertRuleFormData).logSource}
                  onValueChange={(value) =>
                    handleInputChange("logSource", value)
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruleName">Rule Name *</Label>
                <Input
                  id="ruleName"
                  value={(formData as AlertRuleFormData).ruleName}
                  onChange={(e) =>
                    handleInputChange("ruleName", e.target.value)
                  }
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity (0-10)</Label>
                <Input
                  id="severity"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="0-10"
                  onChange={(e) =>
                    handleInputChange("severity", parseInt(e.target.value))
                  }
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="severity">Severity *</Label>
                <Input
                  id="severity"
                  type="number"
                  min="1"
                  max="10"
                  value={(formData as AlertRuleFormData).severity}
                  onChange={(e) =>
                    handleInputChange("severity", Number(e.target.value) || 1)
                  }
                  disabled={loading}
                  required
                />
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={(formData as AlertRuleFormData).description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? mode.startsWith("create")
                  ? "Creating..."
                  : "Updating..."
                : mode.startsWith("create")
                ? "Create"
                : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};