
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TimerChartLegend from '../TimerChartLegend';
import TimerDetails from '../TimerDetails';
import { TimerSessionWithTimer } from '../../../types';

interface VisualizationSidebarContentProps {
  sessions: TimerSessionWithTimer[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  formatTime: (ms: number) => string;
  selectedTimer: any | null;
}

const VisualizationSidebarContent: React.FC<VisualizationSidebarContentProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedTimer
}) => {

  return (
    <div className="pl-2 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Category Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filter by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <TimerChartLegend />
        <TimerDetails timer={selectedTimer} />
        
        {/* Enhanced Guide */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="text-sm text-indigo-700 dark:text-indigo-300">Enhanced Visualization Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 text-indigo-600 dark:text-indigo-400">
            <div>
              <strong>Treemap:</strong> Interactive hierarchical visualization with rectangle sizes representing total time
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
