
import React from 'react';
import { format } from 'date-fns';
import { DayContentProps } from 'react-day-picker';

interface CustomDayRendererProps {
  date: Date;
  getTotalTimeForDate: (date: Date) => number;
  getHeatMapColor: (date: Date) => string;
  selected?: boolean;
  today?: boolean;
}

const CustomDayRenderer: React.FC<CustomDayRendererProps> = ({ 
  date, 
  getTotalTimeForDate, 
  getHeatMapColor,
  selected,
  today
}) => {
  const totalTime = getTotalTimeForDate(date);
  const hasActivity = totalTime > 0;
  const heatMapClass = getHeatMapColor(date);
  
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${
        hasActivity ? heatMapClass : ""
      } rounded-full`}
    >
      <div
        className={`w-8 h-8 flex items-center justify-center rounded-full ${
          today ? "border-2 border-primary font-bold" : ""
        } ${selected ? "bg-primary text-primary-foreground" : ""}`}
      >
        {format(date, "d")}
      </div>
      {hasActivity && !heatMapClass.includes("bg-blue-500") && (
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"></span>
      )}
    </div>
  );
};

// This wrapper is needed to make it compatible with DayPicker's Day component expectations
export const renderDay = (
  getTotalTimeForDate: (date: Date) => number,
  getHeatMapColor: (date: Date) => string
) => {
  return function(props: DayContentProps) {
    const { date, selected } = props;
    const isToday = props.modifiers?.today === true;
    
    return (
      <CustomDayRenderer
        date={date}
        getTotalTimeForDate={getTotalTimeForDate}
        getHeatMapColor={getHeatMapColor}
        selected={selected}
        today={isToday}
      />
    );
  };
};

export default CustomDayRenderer;
