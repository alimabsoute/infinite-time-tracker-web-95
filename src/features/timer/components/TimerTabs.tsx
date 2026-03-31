
import React from 'react';
import { Badge } from '@shared/components/ui/badge';

interface TimerTabsProps {
  sessionCount: number;
}

const TimerTabs: React.FC<TimerTabsProps> = ({ sessionCount }) => {
  // Since we only have one tab now, we can show session count as a badge
  return (
    <div className="flex items-center justify-center mb-3">
      <div className="text-sm font-medium text-muted-foreground">
        Timer
        {sessionCount > 0 && (
          <Badge variant="outline" className="ml-2 h-4 text-[0.6rem] px-1">
            🍅 {sessionCount}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default TimerTabs;
