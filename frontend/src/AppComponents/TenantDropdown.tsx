
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
}

const TenantDropdown = ({ value, onValueChange, disabled = false }: TenantDropdownProps) => {
  const tenants = [
    { value: "TENANT1", label: "Tenant 1" },
    { value: "TENANT2", label: "Tenant 2" },
    { value: "TENANT3", label: "Tenant 3" },
    { value: "TENANT4", label: "Tenant 4" },
  ];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
        <SelectValue placeholder="Select a tenant" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
        {tenants.map((tenant) => (
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

export default TenantDropdown;