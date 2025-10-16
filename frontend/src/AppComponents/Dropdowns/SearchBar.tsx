// src/components/SearchBar.tsx
import { Input } from "@/components/ui/input";
// import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface SearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SearchBar = ({
  value,
  onValueChange,
  placeholder = "Search keywords...",
  disabled = false,
}: SearchBarProps) => {
//   const debouncedValue = useDebouncedValue(value, 500);

  // If you need to do something with debounced value, you can use useEffect here
  // For now, we'll just use it for the actual API calls in the useQuery hooks

  return (
    <div className="relative gap-4 w-full">
      {/* <Search className="text-gray-400 h-4 w-4" /> */}
      <Input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  );
};

export default SearchBar;