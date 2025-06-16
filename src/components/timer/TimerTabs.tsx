
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface TimerTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  sessionCount: number;
}

const TimerTabs: React.FC<TimerTabsProps> = ({
  activeTab,
  onTabChange,
  sessionCount,
}) => {
  return (
    <TabsList className="grid w-full grid-cols-2 mb-3">
      <TabsTrigger value="timer" className="text-xs">Timer</TabsTrigger>
      <TabsTrigger value="pomodoro" className="text-xs">
        Pomodoro
        {sessionCount > 0 && (
          <Badge variant="outline" className="ml-1 h-4 text-[0.6rem] px-1">
            {sessionCount}
          </Badge>
        )}
      </TabsTrigger>
    </TabsList>
  );
};

export default TimerTabs;
