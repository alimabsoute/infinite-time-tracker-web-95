
import React, { useState, useCallback } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { Timer, TimerSessionWithTimer } from '../../../types';
import VisualizationTabsContent from './VisualizationTabsContent';
import VisualizationSidebarContent from './VisualizationSidebarContent';
import EnhancedChartInsights from './EnhancedChartInsights';

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
  const [activeTab, setActiveTab] = useState<string>('treemap');
  const [selectedTimer, setSelectedTimer] = useState<any | null>(null);

  console.log('🔍 ResizableActivityVisualization - Rendering with:', {
    filteredTimersCount: filteredTimers.length,
    sessionsCount: sessions.length,
    selectedCategory,
    activeTab,
    selectedTimer: selectedTimer ? { id: selectedTimer.id, name: selectedTimer.name } : null
  });

  // Get unique categories from sessions
  const categories = ['all', ...new Set(
    sessions
      .map(session => session.timers?.category)
      .filter(Boolean)
      .sort()
  )];

  const handleBubbleClick = useCallback((timer: any) => {
    console.log('🔍 ResizableActivityVisualization - Bubble clicked:', timer);
    setSelectedTimer(timer);
  }, []);

  return (
    <div className="h-[600px] w-full border rounded-lg overflow-hidden bg-background">
      <PanelGroup direction="horizontal" className="h-full">
        {/* Main Visualization Panel */}
        <Panel defaultSize={75} minSize={60}>
          <div className="h-full flex flex-col">
            <VisualizationTabsContent
              sessions={sessions}
              selectedCategory={selectedCategory}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onBubbleClick={handleBubbleClick}
            />
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-2 bg-border hover:bg-border/80 transition-colors" />
        
        {/* Sidebar Panel */}
        <Panel defaultSize={25} minSize={20} maxSize={40}>
          <div className="h-full flex flex-col">
            <VisualizationSidebarContent
              sessions={sessions}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              formatTime={formatTime}
              selectedTimer={selectedTimer}
            />
            
            {/* Enhanced Insights Section */}
            <div className="flex-1 min-h-0 p-3 overflow-auto">
              <EnhancedChartInsights
                sessions={sessions}
                selectedCategory={selectedCategory}
                activeTab={activeTab}
              />
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default ResizableActivityVisualization;
