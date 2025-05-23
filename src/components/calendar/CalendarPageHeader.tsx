
import React from "react";
import { motion } from "framer-motion";
import CalendarFilters from "./CalendarFilters";
import CalendarViewSelector from "./CalendarViewSelector";

interface CalendarPageHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  viewMode: "day" | "week" | "month";
  setViewMode: (mode: "day" | "week" | "month") => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}

const CalendarPageHeader: React.FC<CalendarPageHeaderProps> = ({
  showFilters,
  setShowFilters,
  viewMode,
  setViewMode,
  categoryFilter,
  setCategoryFilter,
  categories
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <motion.h1 
        className="text-2xl font-bold" 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        Activity Calendar
      </motion.h1>
      
      <motion.div 
        className="flex gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CalendarFilters 
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
        />
        
        <CalendarViewSelector 
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </motion.div>
    </div>
  );
};

export default CalendarPageHeader;
