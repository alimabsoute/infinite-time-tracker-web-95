
import React, { useState } from 'react';
import { isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { renderDay } from "./CustomDayRenderer";

export const useEnhancedDayRenderer = (
  getTime: (date: Date) => number,
  getColor: (date: Date) => string,
  selectedDate: Date | undefined
) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  
  const enhancedRenderDay = () => {
    const baseRenderer = renderDay(getTime, getColor);
    
    return (props: any) => {
      const { date } = props;
      const isHovered = hoveredDate && isSameDay(date, hoveredDate);
      const isSelected = selectedDate && isSameDay(date, selectedDate);
      
      // Render the base day with the existing functionality
      const baseDay = baseRenderer(props);
      
      // Add enhanced hover animations
      return (
        <motion.div 
          className={cn(
            "day-container relative",
            isSelected && "selected-day",
            isHovered && "hovered-day"
          )}
          whileHover={{ scale: 1.1 }}
          onHoverStart={() => setHoveredDate(date)}
          onHoverEnd={() => setHoveredDate(null)}
        >
          {baseDay}
        </motion.div>
      );
    };
  };
  
  return enhancedRenderDay();
};
