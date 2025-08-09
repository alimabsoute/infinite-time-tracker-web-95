
import React from 'react';
import { TimerSessionWithTimer } from "../../../types";
import InteractiveTimelineChart from './InteractiveTimelineChart';
import Enhanced2DBubbleChart from './Enhanced2DBubbleChart';
import FallbackBarChart from './FallbackBarChart';

type VisualizationMode = 'timeline' | '2d' | 'bar';

interface VisualizationRendererProps {
  mode: VisualizationMode;
  sessions: TimerSessionWithTimer[];
  startDate: Date;
  endDate: Date;
  hasValidData: boolean;
  onBubbleClick?: (bubble: any) => void;
  onVisualizationError: (error: Error, mode: VisualizationMode) => void;
}

export const VisualizationRenderer: React.FC<VisualizationRendererProps> = ({
  mode,
  sessions,
  startDate,
  endDate,
  hasValidData,
  onBubbleClick,
  onVisualizationError
}) => {
  if (!hasValidData) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p>No timer data available for this date range</p>
          <p className="text-sm mt-2">Create some timers and log time to see visualizations</p>
          <p className="text-xs mt-4 text-slate-400">Sessions: {sessions.length}</p>
        </div>
      </div>
    );
  }

  try {
    switch (mode) {
      case 'timeline':
        return (
          <InteractiveTimelineChart
            sessions={sessions}
            startDate={startDate}
            endDate={endDate}
            onBubbleClick={onBubbleClick}
          />
        );
      case '2d':
        return (
          <Enhanced2DBubbleChart
            sessions={sessions}
            selectedCategory={undefined}
            onBubbleClick={onBubbleClick}
          />
        );
      case 'bar':
        return (
          <FallbackBarChart
            sessions={sessions}
            startDate={startDate}
            endDate={endDate}
            onBubbleClick={onBubbleClick}
          />
        );
      default:
        return (
          <div className="h-[400px] flex items-center justify-center text-red-500">
            <p>Visualization mode not supported</p>
          </div>
        );
    }
  } catch (error) {
    console.error('🔍 VisualizationRenderer - Render error:', error);
    onVisualizationError(error as Error, mode);
    return (
      <div className="h-[400px] flex items-center justify-center text-red-500">
        <p>Error rendering visualization</p>
      </div>
    );
  }
};

export default VisualizationRenderer;
