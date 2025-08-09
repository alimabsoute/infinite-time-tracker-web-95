
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimerSessionWithTimer } from "../../../types";
import Enhanced2DBubbleChart from './Enhanced2DBubbleChart';

import InteractiveTimelineChart from './InteractiveTimelineChart';
import CategoryRadarChart from './CategoryRadarChart';
import InteractiveTreemapChart from './InteractiveTreemapChart';
import TreemapInsights from './TreemapInsights';
import ChartInsights from './ChartInsights';
import TimelineInsights from './TimelineInsights';
import RadarInsights from './RadarInsights';

interface VisualizationTabsContentProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBubbleClick: (timer: any) => void;
}

const VisualizationTabsContent: React.FC<VisualizationTabsContentProps> = ({
  sessions,
  selectedCategory,
  activeTab,
  setActiveTab,
  onBubbleClick
}) => {
  console.log('🔍 VisualizationTabsContent - Rendering with:', {
    sessionsCount: sessions.length,
    selectedCategory,
    activeTab,
    hasClickHandler: !!onBubbleClick
  });

  return (
    <div className="h-full pr-2">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="mb-4 flex-shrink-0 bg-background/50 backdrop-blur-sm">
          <TabsTrigger value="treemap" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Treemap
          </TabsTrigger>
          <TabsTrigger value="2d" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            2D Bubbles
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="radar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Radar Chart
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 min-h-0 overflow-auto">
          <TabsContent value="treemap" className="mt-0 space-y-6">
            <div className="h-[400px]">
              <InteractiveTreemapChart 
                sessions={sessions} 
                selectedCategory={selectedCategory}
                onBubbleClick={onBubbleClick}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Interactive hierarchical treemap • Rectangle size shows total time • Click to select • Toggle view modes
            </p>
            <TreemapInsights 
              sessions={sessions}
              selectedCategory={selectedCategory}
            />
          </TabsContent>

          
          <TabsContent value="2d" className="mt-0 space-y-6">
            <div className="h-[400px]">
              <Enhanced2DBubbleChart 
                sessions={sessions} 
                selectedCategory={selectedCategory}
                onBubbleClick={onBubbleClick}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Fixed 2D bubble chart with proper bubble rendering • Bubble size represents session count • Click bubbles for details
            </p>
            <ChartInsights 
              sessions={sessions}
              selectedCategory={selectedCategory}
            />
          </TabsContent>

          <TabsContent value="timeline" className="mt-0 space-y-6">
            <div className="h-[400px]">
              <InteractiveTimelineChart 
                sessions={sessions} 
                selectedCategory={selectedCategory}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Interactive timeline with enhanced date range support • Click bars to see session details • Hover for quick info
            </p>
            <TimelineInsights 
              sessions={sessions}
              selectedCategory={selectedCategory}
            />
          </TabsContent>

          <TabsContent value="radar" className="mt-0 space-y-6">
            <div className="h-[400px]">
              <CategoryRadarChart 
                sessions={sessions} 
                selectedCategory={selectedCategory}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Enhanced category performance radar with improved interactivity • Shows time, sessions, and efficiency metrics
            </p>
            <RadarInsights 
              sessions={sessions}
              selectedCategory={selectedCategory}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default VisualizationTabsContent;
