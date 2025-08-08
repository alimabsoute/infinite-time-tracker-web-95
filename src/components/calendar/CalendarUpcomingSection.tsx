
import React from 'react';
import UpcomingDeadlines from './UpcomingDeadlines';
import { Timer } from "../../types";

interface CalendarUpcomingSectionProps {
  timers: Timer[];
}

const CalendarUpcomingSection: React.FC<CalendarUpcomingSectionProps> = ({ timers }) => {
  return (
    <div className="lg:col-span-4 col-span-1">
      <UpcomingDeadlines timers={timers} />
    </div>
  );
};

export default CalendarUpcomingSection;
