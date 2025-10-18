import React, { useState } from "react";
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check } from "lucide-react";
import TenantDropdown from "../Dropdowns/TenantDropdown";
import { toast } from "sonner";
import { invalidateLogsAlerts } from "@/query/queryClient";
import { createLog } from "@/apiEndpoints/Logs";

interface CreateSyslogProps {
  currentTenant: string;
  trigger: React.ReactNode;
}

export const CreateSyslog: React.FC<CreateSyslogProps> = ({
  currentTenant,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    tenant: "TENANT1",
    source: "FIREWALL",
    payload: "",
  });
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const syslogExamples = {
    FIREWALL: "<134>fw01 vendor=demo product=ngfw src=10.0.1.10 dst=8.8.8.8 spt=5353 dpt=53 severity=8 proto=udp msg='DNS blocked action=DENY",
    NETWORK: "<190>Aug 20 13:01:02 r1 if=ge-0/0/1 event=link-down src=10.0.1.10 mac=aa:bb:cc:dd:ee:ff reason=carrier-loss action=BLOCK"
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast(`${fieldName} example copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tenant) {
      toast.error("Please select a tenant");
      return;
    }

    if (!formData.payload.trim()) {
      toast.error("Please enter a syslog payload");
      return;
    }

    setLoading(true);
    try {
      const result = await createLog(formData);
      invalidateLogsAlerts(currentTenant);

      if (result.success) {
        toast.success(result.message || "Syslog created successfully");
        setFormData({
          tenant: "TENANT1",
          source: "FIREWALL",
          payload: "",
        });
        setOpen(false);
      } else {
        toast.error(result.message || "Failed to create syslog");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create syslog");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Reset form when dialog closes
    if (!isOpen) {
      setFormData({
        tenant: "TENANT1",
        source: "FIREWALL",
        payload: "",
      });
      setCopiedField(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create SysLog</DialogTitle>
          <DialogDescription>Send a new syslog</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Tenant Field */}
            <div className="space-y-2">
              <Label htmlFor="tenant">Tenant *</Label>
              <TenantDropdown
                value={formData.tenant}
                onValueChange={(value) => handleInputChange("tenant", value)}
                disabled={loading}
              />
            </div>

            {/* Source Field */}
            <div className="space-y-2">
              <Label htmlFor="source">Source *</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleInputChange("source", value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIREWALL">FIREWALL</SelectItem>
                  <SelectItem value="NETWORK">NETWORK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payload Field */}
          <div className="space-y-2">
            <Label htmlFor="payload">Syslog Payload *</Label>
            <Input
              id="payload"
              value={formData.payload}
              onChange={(e) => handleInputChange("payload", e.target.value)}
              disabled={loading}
              placeholder="Enter syslog"
              required
            />
          </div>

          {/* Syslog Examples */}
          <div className="space-y-3">
            <Label>Syslog Examples</Label>
            
            {/* Firewall Example */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="firewall-example" className="text-sm font-medium text-gray-700">
                  Firewall Example
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => copyToClipboard(syslogExamples.FIREWALL, "Firewall")}
                >
                  {copiedField === "Firewall" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="firewall-example"
                  value={syslogExamples.FIREWALL}
                  readOnly
                  className="pr-10 font-mono text-xs bg-gray-50 cursor-pointer"
                  onClick={() => copyToClipboard(syslogExamples.FIREWALL, "Firewall")}
                />
              </div>
            </div>

            {/* Network Example */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="network-example" className="text-sm font-medium text-gray-700">
                  Network Example
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => copyToClipboard(syslogExamples.NETWORK, "Network")}
                >
                  {copiedField === "Network" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="network-example"
                  value={syslogExamples.NETWORK}
                  readOnly
                  className="pr-10 font-mono text-xs bg-gray-50 cursor-pointer"
                  onClick={() => copyToClipboard(syslogExamples.NETWORK, "Network")}
                />
              </div>
            </div>
          </div>

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
              {loading ? "Creating Syslog..." : "Create Syslog"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};