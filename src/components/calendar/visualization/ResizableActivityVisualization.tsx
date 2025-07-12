
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Timer, TimerSessionWithTimer } from "../../../types";
import Enhanced2DBubbleChart from './Enhanced2DBubbleChart';
import Enhanced3DBubbleChart from './Enhanced3DBubbleChart';
import TimerCategoryFilter from '../TimerCategoryFilter';
import TimerChartLegend from '../TimerChartLegend';
import TimerDetails from '../TimerDetails';

interface ResizableActivityVisualizationProps {
  filteredTimers: Timer[];
  sessions: TimerSessionWithTimer[];
  formatTime: (ms: number) => string;
}

const ResizableActivityVisualization: React.FC<ResizableActivityVisualizationProps> = ({
  sessions
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimer, setSelectedTimer] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('3d');

  const handleBubbleClick = (timer: any) => {
    setSelectedTimer(timer);
  };

  // Calculate summary statistics
  const totalSessions = sessions.filter(s => s.duration_ms).length;
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
  const avgSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;
  const uniqueTimers = new Set(sessions.map(s => s.timer_id)).size;

  return (
    <div className="space-y-6">
      {/* Summary Stats - Fixed at top */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
            <p className="text-sm text-gray-600">Total Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{(totalTime / (1000 * 60 * 60)).toFixed(1)}h</div>
            <p className="text-sm text-gray-600">Total Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{(avgSessionTime / (1000 * 60)).toFixed(0)}m</div>
            <p className="text-sm text-gray-600">Avg Session</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{uniqueTimers}</div>
            <p className="text-sm text-gray-600">Active Timers</p>
          </CardContent>
        </Card>
      </div>

      {/* Resizable Layout */}
      <Card className="h-[500px]">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Timer Performance Analysis</CardTitle>
            <TimerCategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-80px)]">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Main Chart Area */}
            <ResizablePanel defaultSize={75} minSize={50}>
              <div className="h-full pr-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="3d">3D Interactive</TabsTrigger>
                    <TabsTrigger value="2d">2D Chart</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="3d" className="h-[calc(100%-60px)]">
                    <Enhanced3DBubbleChart 
                      sessions={sessions} 
                      selectedCategory={selectedCategory}
                      onBubbleClick={handleBubbleClick}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Click and drag to rotate • Scroll to zoom • Click bubbles for details • Reset button in top-right
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="2d" className="h-[calc(100%-60px)]">
                    <Enhanced2DBubbleChart 
                      sessions={sessions} 
                      selectedCategory={selectedCategory}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Bubble size represents number of sessions • Hover for details
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>

            {/* Resizable Handle */}
            <ResizableHandle withHandle />

            {/* Sidebar */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <div className="pl-2 h-full space-y-4 overflow-y-auto">
                <TimerChartLegend />
                <TimerDetails timer={selectedTimer} />
                
                {/* Additional info card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Visualization Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div>
                      <strong>3D View:</strong> Interactive exploration with rotation and zoom
                    </div>
                    <div>
                      <strong>2D View:</strong> Traditional scatter plot with proportional bubbles
                    </div>
                    <div>
                      <strong>Resize:</strong> Drag the separator to expand chart area
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </CardContent>
      </Card>

      {/* About Section - Fixed at bottom */}
      <Card>
        <CardHeader>
          <CardTitle>About This Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-gray-600">
            <p>
              This enhanced visualization shows your timer usage patterns with improved clarity and interactivity. 
              Each bubble represents a timer with size proportional to the number of sessions and pastel colors for better visibility.
            </p>
            <ul className="mt-4 space-y-1">
              <li><strong>2D Chart:</strong> Proper circular bubbles with relative sizing based on session count</li>
              <li><strong>3D Chart:</strong> Enhanced with axis lines, arrows, and a reset button for easy navigation</li>
              <li><strong>Resizable Layout:</strong> Drag the separator to expand the chart area as needed</li>
              <li><strong>Pastel Colors:</strong> Improved visibility with transparent, easy-on-the-eyes colors</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResizableActivityVisualization;
