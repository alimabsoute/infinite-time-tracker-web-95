
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer, TimerSessionWithTimer } from "../../types";
import TimerBubbleChart3D from './TimerBubbleChart3D';
import TimerBubbleChart2D from './TimerBubbleChart2D';
import TimerCategoryFilter from './TimerCategoryFilter';
import TimerChartLegend from './TimerChartLegend';
import TimerDetails from './TimerDetails';

interface ActivityVisualizationProps {
  filteredTimers: Timer[];
  sessions: TimerSessionWithTimer[];
  formatTime: (ms: number) => string;
}

const ActivityVisualization: React.FC<ActivityVisualizationProps> = ({
  sessions
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimer, setSelectedTimer] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('3d');

  console.log('ActivityVisualization - Rendering with:', {
    sessionsCount: sessions.length
  });

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
      {/* Summary Stats */}
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Timer Performance Analysis</CardTitle>
                <TimerCategoryFilter 
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="3d">3D Interactive</TabsTrigger>
                  <TabsTrigger value="2d">2D Chart</TabsTrigger>
                </TabsList>
                
                <TabsContent value="3d">
                  <TimerBubbleChart3D 
                    sessions={sessions} 
                    selectedCategory={selectedCategory}
                    onBubbleClick={handleBubbleClick}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Click and drag to rotate • Scroll to zoom • Click bubbles for details
                  </p>
                </TabsContent>
                
                <TabsContent value="2d">
                  <TimerBubbleChart2D 
                    sessions={sessions} 
                    selectedCategory={selectedCategory}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TimerChartLegend />
          <TimerDetails timer={selectedTimer} />
        </div>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>About This Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-gray-600">
            <p>
              This visualization shows your timer usage patterns and productivity insights. 
              Each bubble represents a timer, with position indicating total time spent (x-axis) and 
              average session length (y-axis), while bubble size represents the number of sessions.
            </p>
            <ul className="mt-4 space-y-1">
              <li><strong>High-time, long-session timers</strong> appear in the top-right quadrant</li>
              <li><strong>Frequently used timers</strong> are represented by larger bubbles</li>
              <li><strong>Category filtering</strong> allows focused analysis of specific timer types</li>
              <li><strong>Interactive 3D view</strong> provides an engaging way to explore your data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityVisualization;
