import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const DateFilter = ({ value, onValueChange, disabled = false }: DateFilterProps) => {
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      onValueChange(formattedDate);
    } else {
      onValueChange("");
    }
  };


  const displayDate = (() => {
    try {
      if (value.startsWith("{")) {
        const { start, end } = JSON.parse(value);
        return `${format(new Date(start), "MMM dd")} - ${format(
          new Date(end),
          "MMM dd, yyyy"
        )}`;
      }
      return value ? format(new Date(value), "MMM dd, yyyy") : "";
    } catch {
      return "";
    }
  })();

  return (
    <div className="w-full">

      {/* Calendar Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayDate || "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            className="bg-white dark:bg-gray-800"
          />
        </PopoverContent>
      </Popover>

      {/* Quick Presets */}
      {/* <div className="mt-2 flex flex-wrap gap-1">
        {presetOptions.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetSelect(option.value)}
            disabled={disabled}
            className="text-xs h-7 px-2"
          >
            {option.label}
          </Button>
        ))}
        {value && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="text-xs h-7 px-2"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div> */}

      {/* Selected date display */}
      {/* {value && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Selected: {displayDate}
        </div>
      )} */}
    </div>
  );
};

export default DateFilter;