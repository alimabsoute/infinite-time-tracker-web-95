
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Timer, TimerSessionWithTimer } from "../../../types";
import Enhanced2DBubbleChart from './Enhanced2DBubbleChart';
import Enhanced3DBubbleChart from './Enhanced3DBubbleChart';
import InteractiveTimelineChart from './InteractiveTimelineChart';
import CategoryRadarChart from './CategoryRadarChart';
import EnhancedNetworkGraph3D from './EnhancedNetworkGraph3D';
import EnhancedChartInsights from './EnhancedChartInsights';
import TimerCategoryFilter from '../TimerCategoryFilter';
import TimerChartLegend from '../TimerChartLegend';
import TimerDetails from '../TimerDetails';

interface ResizableActivityVisualizationProps {
  filteredTimers: Timer[];
  sessions: TimerSessionWithTimer[];
  formatTime: (ms: number) => string;
}

const ResizableActivityVisualization: React.FC<ResizableActivityVisualizationProps> = ({
  filteredTimers,
  sessions,
  formatTime
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimer, setSelectedTimer] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('3d');

  console.log('🔍 ResizableActivityVisualization - Rendering with:', {
    filteredTimersCount: filteredTimers.length,
    sessionsCount: sessions.length,
    selectedCategory,
    activeTab
  });

  const handleBubbleClick = (timer: any) => {
    console.log('🔍 ResizableActivityVisualization - Timer selected:', timer);
    setSelectedTimer(timer);
  };

  // Calculate summary statistics
  const totalSessions = sessions.filter(s => s.duration_ms && s.duration_ms > 0).length;
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
  const avgSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;
  const uniqueTimers = new Set(sessions.map(s => s.timer_id)).size;

  // Get insights tab based on active visualization tab
  const getInsightsTab = () => {
    switch (activeTab) {
      case 'timeline': return 'timeline';
      case 'radar': return 'radar';
      case 'network': return 'network';
      default: return 'general';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalSessions}</div>
            <p className="text-sm text-blue-700 dark:text-blue-300">Total Sessions</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{(totalTime / (1000 * 60 * 60)).toFixed(1)}h</div>
            <p className="text-sm text-green-700 dark:text-green-300">Total Time</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{(avgSessionTime / (1000 * 60)).toFixed(0)}m</div>
            <p className="text-sm text-orange-700 dark:text-orange-300">Avg Session</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{uniqueTimers}</div>
            <p className="text-sm text-purple-700 dark:text-purple-300">Active Timers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Visualization Area - Fixed Height Container */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Enhanced Analytics Dashboard
            </CardTitle>
            <TimerCategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-[600px]">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Main Chart Area */}
              <ResizablePanel defaultSize={75} minSize={60}>
                <div className="h-full pr-2">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="mb-4 flex-shrink-0 bg-background/50 backdrop-blur-sm">
                      <TabsTrigger value="3d" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        3D Bubbles
                      </TabsTrigger>
                      <TabsTrigger value="2d" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        2D Scatter
                      </TabsTrigger>
                      <TabsTrigger value="timeline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Timeline
                      </TabsTrigger>
                      <TabsTrigger value="radar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Radar Chart
                      </TabsTrigger>
                      <TabsTrigger value="network" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Network 3D
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex-1 min-h-0">
                      <TabsContent value="3d" className="h-full mt-0">
                        <div className="h-full flex flex-col">
                          <div className="flex-1 min-h-0">
                            <Enhanced3DBubbleChart 
                              sessions={sessions} 
                              selectedCategory={selectedCategory}
                              onBubbleClick={handleBubbleClick}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center flex-shrink-0">
                            Enhanced 3D bubble chart with unique timer colors • Click and drag to rotate • Scroll to zoom • Click bubbles for details
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="2d" className="h-full mt-0">
                        <div className="h-full flex flex-col">
                          <div className="flex-1 min-h-0">
                            <Enhanced2DBubbleChart 
                              sessions={sessions} 
                              selectedCategory={selectedCategory}
                              onBubbleClick={handleBubbleClick}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center flex-shrink-0">
                            Enhanced 2D scatter plot with unique timer colors • Bubble size represents session count • Click bubbles for details
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="timeline" className="h-full mt-0">
                        <div className="h-full flex flex-col">
                          <div className="flex-1 min-h-0">
                            <InteractiveTimelineChart 
                              sessions={sessions} 
                              selectedCategory={selectedCategory}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center flex-shrink-0">
                            Interactive timeline with enhanced date range support • Click bars to see session details • Hover for quick info
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="radar" className="h-full mt-0">
                        <div className="h-full flex flex-col">
                          <div className="flex-1 min-h-0">
                            <CategoryRadarChart 
                              sessions={sessions} 
                              selectedCategory={selectedCategory}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center flex-shrink-0">
                            Enhanced category performance radar with improved interactivity • Shows time, sessions, and efficiency metrics
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="network" className="h-full mt-0">
                        <div className="h-full flex flex-col">
                          <div className="flex-1 min-h-0">
                            <EnhancedNetworkGraph3D 
                              sessions={sessions} 
                              selectedCategory={selectedCategory}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center flex-shrink-0">
                            Enhanced 3D network with robust error handling • Connected nodes show category relationships
                          </p>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </ResizablePanel>

              {/* Resizable Handle */}
              <ResizableHandle withHandle className="bg-border/50 hover:bg-border transition-colors" />

              {/* Enhanced Sidebar */}
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
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
                          <strong>Network 3D:</strong> Robust relationship visualization with comprehensive error boundaries
                        </div>
                        <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800">
                          <strong>New Features:</strong> Smart insights, enhanced colors, comprehensive date filtering
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Chart-Specific Insights */}
      <EnhancedChartInsights 
        sessions={sessions}
        selectedCategory={selectedCategory}
        activeTab={getInsightsTab()}
      />
    </div>
  );
};

export default ResizableActivityVisualization;
