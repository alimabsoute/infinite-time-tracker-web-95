
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Timer, TimerSessionWithTimer } from "../../../types";
import TimerCategoryFilter from '../TimerCategoryFilter';
import EnhancedChartInsights from './EnhancedChartInsights';
import ActivitySummaryStats from './ActivitySummaryStats';
import VisualizationTabsContent from './VisualizationTabsContent';
import VisualizationSidebarContent from './VisualizationSidebarContent';

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
      <ActivitySummaryStats sessions={sessions} />

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
                <VisualizationTabsContent
                  sessions={sessions}
                  selectedCategory={selectedCategory}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onBubbleClick={handleBubbleClick}
                />
              </ResizablePanel>

              {/* Resizable Handle */}
              <ResizableHandle withHandle className="bg-border/50 hover:bg-border transition-colors" />

              {/* Enhanced Sidebar */}
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <VisualizationSidebarContent selectedTimer={selectedTimer} />
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
