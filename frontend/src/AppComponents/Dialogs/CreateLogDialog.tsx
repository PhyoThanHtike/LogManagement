// src/components/logs/CreateLogDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SourceFilter from "../Dropdowns/SourceFilter";
import TenantDropdown from "../Dropdowns/TenantDropdown";
import { createLog } from "@/apiEndpoints/Logs";
import { toast } from "sonner";
import ActionFilter from "../Dropdowns/ActionFilter";

interface CreateLogDialogProps {
  trigger?: React.ReactNode;
  onLogCreated?: (log: any) => void;
}

interface LogFormData {
  tenant: string;
  source: string;
  payload: any;
}

export default function CreateLogDialog({ trigger }: CreateLogDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LogFormData>({
    tenant: "",
    source: "API",
    payload: {},
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        tenant: "",
        source: "API",
        payload: {},
      });
    }
  }, [open]);

  const handleSourceChange = (source: string) => {
    setFormData((prev) => ({
      ...prev,
      source,
      payload: {}, // Reset payload when source changes
    }));
  };

  const handleTenantChange = (tenant: string) => {
    setFormData((prev) => ({
      ...prev,
      tenant,
      payload: {}, // Reset payload when source changes
    }));
  };

  const handlePayloadChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      payload: {
        ...prev.payload,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting log data:", formData);

      // Use your createLog API function
      const response = await createLog(formData);

      if (response.success) {
        toast.success("Log created successfully!");
        // onLogCreated?.(formData); // Pass the form data back to parent
        setOpen(false);
      } else {
        toast.error(response.message || "Failed to create log");
        console.error("Failed to create log:", response.message);
      }
    } catch (error) {
      console.error("Error creating log:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderPayloadFields = () => {
    switch (formData.source) {
      case "API":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Input
                  id="action"
                  placeholder="e.g., LOGIN, ALERT, ALLOW, DENY, BLOCK"
                  onChange={(e) =>
                    handlePayloadChange("action", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity (0-10)</Label>
                <Input
                  id="severity"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="0-10"
                  onChange={(e) =>
                    handlePayloadChange("severity", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Input
                  id="eventType"
                  placeholder="e.g., application"
                  onChange={(e) =>
                    handlePayloadChange("event_type", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Input
                id="user"
                placeholder="Username"
                onChange={(e) => handlePayloadChange("user", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="srcIp">Source IP</Label>
              <Input
                id="srcIp"
                placeholder="192.168.1.1"
                onChange={(e) => handlePayloadChange("ip", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="Reason for the event"
                onChange={(e) => handlePayloadChange("reason", e.target.value)}
              />
            </div>
          </div>
        );

      case "FIREWALL":
      case "NETWORK":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                placeholder="e.g., ALLOW, DENY, ALERT, QUARANTINE, BLOCK"
                onChange={(e) => handlePayloadChange("action", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="srcIp">Source IP</Label>
                <Input
                  id="srcIp"
                  placeholder="192.168.1.1"
                  onChange={(e) =>
                    handlePayloadChange("src_ip", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dstIp">Destination IP</Label>
                <Input
                  id="dstIp"
                  placeholder="10.0.0.1"
                  onChange={(e) =>
                    handlePayloadChange("dst_ip", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="srcPort">Source Port</Label>
                <Input
                  id="srcPort"
                  type="number"
                  placeholder="80"
                  onChange={(e) =>
                    handlePayloadChange("src_port", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dstPort">Destination Port</Label>
                <Input
                  id="dstPort"
                  type="number"
                  placeholder="443"
                  onChange={(e) =>
                    handlePayloadChange("dst_port", parseInt(e.target.value))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="protocol">Protocol</Label>
                <Input
                  id="protocol"
                  placeholder="TCP, UDP, etc."
                  onChange={(e) =>
                    handlePayloadChange("protocol", e.target.value)
                  }
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
                    handlePayloadChange("severity", parseInt(e.target.value))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason/Message</Label>
              <Input
                id="reason"
                placeholder="Firewall rule match or reason"
                onChange={(e) => handlePayloadChange("reason", e.target.value)}
              />
            </div>
          </div>
        );

      case "AWS":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                placeholder="e.g., LOGIN, ALLOW, CREATE"
                onChange={(e) => handlePayloadChange("action", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Input
                id="user"
                placeholder="Username/ARN"
                onChange={(e) => handlePayloadChange("user", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="srcIp">Source IP</Label>
              <Input
                id="srcIp"
                placeholder="192.168.1.1"
                onChange={(e) => handlePayloadChange("ip", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cloudAccountId">Account ID</Label>
                <Input
                  id="cloudAccountId"
                  placeholder="AWS Account ID"
                  onChange={(e) =>
                    handlePayloadChange("cloud.account_id", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cloudRegion">Region</Label>
                <Input
                  id="cloudRegion"
                  placeholder="us-east-1"
                  onChange={(e) =>
                    handlePayloadChange("cloud.region", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cloudService">Service</Label>
              <Input
                id="cloudService"
                placeholder="e.g., s3, ec2"
                onChange={(e) =>
                  handlePayloadChange("cloud.service", e.target.value)
                }
              />
            </div>
          </div>
        );

      case "M365":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                placeholder="e.g., LOGIN, ALLOW"
                onChange={(e) => handlePayloadChange("action", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Input
                id="user"
                placeholder="User email"
                onChange={(e) => handlePayloadChange("user", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="srcIp">Source IP</Label>
              <Input
                id="srcIp"
                placeholder="192.168.1.1"
                onChange={(e) => handlePayloadChange("ip", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workload">Workload</Label>
              <Input
                id="workload"
                placeholder="e.g., Exchange, SharePoint"
                onChange={(e) =>
                  handlePayloadChange("workload", e.target.value)
                }
              />
            </div>
          </div>
        );

      case "AD":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                placeholder="e.g., LOGIN, ALLOW"
                onChange={(e) => handlePayloadChange("action", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
              <Label htmlFor="eventId">Event ID</Label>
              <Input
                id="eventId"
                placeholder="e.g., 4624, 4625"
                onChange={(e) =>
                  handlePayloadChange("event_id", e.target.value)
                }
              />
            </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Input
                  id="eventType"
                  placeholder="e.g., application"
                  onChange={(e) =>
                    handlePayloadChange("event_type", e.target.value)
                  }
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Input
                id="user"
                placeholder="Username"
                onChange={(e) => handlePayloadChange("user", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                placeholder="Hostname"
                onChange={(e) => handlePayloadChange("host", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="srcIp">Source IP</Label>
              <Input
                id="srcIp"
                placeholder="192.168.1.1"
                onChange={(e) => handlePayloadChange("ip", e.target.value)}
              />
            </div>
          </div>
        );

      case "CROWDSTRIKE":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                placeholder="e.g., ALERT, DENY, BLOCK, QUARANTINE"
                onChange={(e) => handlePayloadChange("action", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                placeholder="Hostname"
                onChange={(e) => handlePayloadChange("host", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity (0-10)</Label>
                <Input
                  id="severity"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="0-10"
                  onChange={(e) =>
                    handlePayloadChange("severity", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Input
                  id="eventType"
                  placeholder="e.g., application"
                  onChange={(e) =>
                    handlePayloadChange("event_type", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="process">Process</Label>
              <Input
                id="process"
                placeholder="Process name"
                onChange={(e) => handlePayloadChange("process", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="srcIp">Source IP</Label>
              <Input
                id="srcIp"
                placeholder="192.168.1.1"
                onChange={(e) => handlePayloadChange("ip", e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rawPayload">Raw JSON Payload</Label>
              <Textarea
                id="rawPayload"
                placeholder='{"key": "value"}'
                rows={6}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData((prev) => ({ ...prev, payload: parsed }));
                  } catch {
                    // Keep as string if invalid JSON
                    setFormData((prev) => ({
                      ...prev,
                      payload: e.target.value,
                    }));
                  }
                }}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="default">Create Log</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Log Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant</Label>
                <TenantDropdown
                  value={formData.tenant}
                  onValueChange={handleTenantChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <SourceFilter
                  value={formData.source}
                  onValueChange={handleSourceChange}
                />
              </div>
            </div>
          </div>

          {/* Source-specific fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Log Details</h3>
            {renderPayloadFields()}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Log"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
