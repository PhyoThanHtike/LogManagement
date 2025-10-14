// src/components/filters/TenantDropdown.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TenantDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  userRole?: string;
  userTenant?: string;
}

const TenantFilter = ({
  value,
  onValueChange,
  disabled = false,
  userRole,
  userTenant,
}: TenantDropdownProps) => {
  const tenants = [
    { value: "ALL_TENANTS", label: "All Tenants" },
    { value: "TENANT1", label: "Tenant 1" },
    { value: "TENANT2", label: "Tenant 2" },
    { value: "TENANT3", label: "Tenant 3" },
    { value: "TENANT4", label: "Tenant 4" },
  ];

  // For non-ADMIN users, filter tenants to only show their assigned tenant
  const availableTenants = userRole === 'ADMIN' 
    ? tenants 
    : userTenant 
      ? tenants.filter(tenant => tenant.value === "" || tenant.value === userTenant)
      : [{ value: "", label: "All Tenants" }];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
        <SelectValue placeholder="Select a tenant" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
        {availableTenants.map((tenant) => (
          <SelectItem
            key={tenant.value}
            value={tenant.value}
            className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-600"
          >
            {tenant.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TenantFilter;