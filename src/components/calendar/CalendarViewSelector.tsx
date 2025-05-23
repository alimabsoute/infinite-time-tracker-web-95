
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarViewSelectorProps {
  viewMode: "day" | "week" | "month";
  setViewMode: (mode: "day" | "week" | "month") => void;
}

const CalendarViewSelector: React.FC<CalendarViewSelectorProps> = ({
  viewMode,
  setViewMode
}) => {
  return (
    <Select value={viewMode} onValueChange={(value) => setViewMode(value as "day" | "week" | "month")}>
      <SelectTrigger className="w-28">
        <SelectValue placeholder="View mode" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="day">Day View</SelectItem>
        <SelectItem value="week">Week View</SelectItem>
        <SelectItem value="month">Month View</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CalendarViewSelector;
