
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimerSessionWithTimer } from "../../../types";
import Enhanced2DBubbleChart from './Enhanced2DBubbleChart';
import Enhanced3DBubbleChart from './Enhanced3DBubbleChart';
import InteractiveTimelineChart from './InteractiveTimelineChart';
import CategoryRadarChart from './CategoryRadarChart';
import ConsolidatedNetworkGraph3D from './ConsolidatedNetworkGraph3D';

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
  return (
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
                  onBubbleClick={onBubbleClick}
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
                  onBubbleClick={onBubbleClick}
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
                <ConsolidatedNetworkGraph3D 
                  sessions={sessions} 
                  selectedCategory={selectedCategory}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center flex-shrink-0">
                Consolidated 3D network with robust error handling • Connected nodes show timer relationships and usage patterns
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default VisualizationTabsContent;
