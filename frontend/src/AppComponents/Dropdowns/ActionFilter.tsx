// src/components/filters/ActionFilter.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActionFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const ActionFilter = ({ value, onValueChange, disabled = false }: ActionFilterProps) => {
  const actions = [
    { value: "ALL", label: "All Actions" },
    { value: "ALLOW", label: "Allow" },
    { value: "DENY", label: "Deny" },
    { value: "CREATE", label: "Create" },
    { value: "DELETE", label: "Delete" },
    { value: "UPDATE", label: "Update" },
    { value: "ALERT", label: "Alert" },
    { value: "LOGIN", label: "Login" },
    { value: "QUARANTINE", label: "Quarantine" },
    { value: "BLOCK", label: "Block" },
  ];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
        <SelectValue placeholder="Select action" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
        {actions.map((action) => (
          <SelectItem
            key={action.value}
            value={action.value}
            className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-600"
          >
            {action.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ActionFilter;