
import React from 'react';
import UpcomingDeadlines from './UpcomingDeadlines';
import { Timer } from "../../types";

interface CalendarUpcomingSectionProps {
  timers: Timer[];
}

const CalendarUpcomingSection: React.FC<CalendarUpcomingSectionProps> = ({ timers }) => {
  return (
    <div className="col-span-full">
      <UpcomingDeadlines timers={timers} />
    </div>
  );
};

export default CalendarUpcomingSection;
