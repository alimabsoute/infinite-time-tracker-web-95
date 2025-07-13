
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TimerChartLegend from '../TimerChartLegend';
import TimerDetails from '../TimerDetails';

interface VisualizationSidebarContentProps {
  selectedTimer: any | null;
}

const VisualizationSidebarContent: React.FC<VisualizationSidebarContentProps> = ({
  selectedTimer
}) => {
  return (
    <div className="pl-2 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4">
        <TimerChartLegend />
        <TimerDetails timer={selectedTimer} />
        
        {/* Enhanced Guide */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="text-sm text-indigo-700 dark:text-indigo-300">Enhanced Visualization Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 text-indigo-600 dark:text-indigo-400">
            <div>
              <strong>3D Bubbles:</strong> Enhanced sphere visualization with unique timer colors and error handling
            </div>
            <div>
              <strong>2D Scatter:</strong> Improved bubble chart with better color differentiation
            </div>
            <div>
              <strong>Timeline:</strong> Interactive daily activity bars with comprehensive date range support
            </div>
            <div>
              <strong>Radar Chart:</strong> Multi-metric category performance with enhanced interactivity
            </div>
            <div>
              <strong>Network 3D:</strong> Consolidated relationship visualization with comprehensive error boundaries
            </div>
            <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800">
              <strong>Fixed Features:</strong> Robust error handling, improved positioning, consolidated codebase
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisualizationSidebarContent;
