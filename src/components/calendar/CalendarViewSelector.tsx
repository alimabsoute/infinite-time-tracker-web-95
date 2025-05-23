
import React from "react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Select value={viewMode} onValueChange={(value) => setViewMode(value as "day" | "week" | "month")}>
        <SelectTrigger className="w-32 transition-all hover:border-primary focus:border-primary">
          <SelectValue placeholder="View mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Day View</SelectItem>
          <SelectItem value="week">Week View</SelectItem>
          <SelectItem value="month">Month View</SelectItem>
        </SelectContent>
      </Select>
    </motion.div>
  );
};

export default CalendarViewSelector;
