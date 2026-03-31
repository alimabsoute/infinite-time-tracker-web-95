
import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";

interface CalendarActionButtonsProps {
  viewMode: "day" | "week" | "month";
  setViewMode: (mode: "day" | "week" | "month") => void;
  setShowFilters: (show: boolean) => void;
  showFilters: boolean;
}

const CalendarActionButtons: React.FC<CalendarActionButtonsProps> = ({
  viewMode,
  setViewMode,
  setShowFilters,
  showFilters
}) => {
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-1"
      >
        <Filter size={14} />
        Filters
      </Button>
      
      <Select 
        value={viewMode} 
        onValueChange={(value) => setViewMode(value as "day" | "week" | "month")}
      >
        <SelectTrigger className="w-28">
          <SelectValue placeholder="View mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Day View</SelectItem>
          <SelectItem value="week">Week View</SelectItem>
          <SelectItem value="month">Month View</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
};

export default CalendarActionButtons;
