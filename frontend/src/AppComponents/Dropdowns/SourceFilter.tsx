// src/components/filters/SourceFilter.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SourceFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const SourceFilter = ({ value, onValueChange, disabled = false }: SourceFilterProps) => {
  const sources = [
    { value: "ALL", label: "All Sources" },
    { value: "FIREWALL", label: "Firewall" },
    { value: "API", label: "API" },
    { value: "CROWDSTRIKE", label: "CrowdStrike" },
    { value: "AWS", label: "AWS" },
    { value: "M365", label: "Microsoft 365" },
    { value: "AD", label: "Active Directory" },
    { value: "NETWORK", label: "Network" },
  ];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
        <SelectValue placeholder="Select source" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
        {sources.map((source) => (
          <SelectItem
            key={source.value}
            value={source.value}
            className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-600"
          >
            {source.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SourceFilter;