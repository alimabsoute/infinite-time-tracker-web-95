
import React from 'react';
import { TimerSessionWithTimer } from '../../../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartInsights from './ChartInsights';
import TimelineInsights from './TimelineInsights';
import RadarInsights from './RadarInsights';
import NetworkInsights from './NetworkInsights';
import { Activity, Calendar, Target, Network } from 'lucide-react';

interface EnhancedChartInsightsProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  activeTab?: string;
}

const EnhancedChartInsights: React.FC<EnhancedChartInsightsProps> = ({ 
  sessions, 
  selectedCategory,
  activeTab = 'general'
}) => {
  return (
    <Tabs defaultValue={activeTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="general" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          <span className="hidden sm:inline">General</span>
        </TabsTrigger>
        <TabsTrigger value="timeline" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="hidden sm:inline">Timeline</span>
        </TabsTrigger>
        <TabsTrigger value="radar" className="flex items-center gap-1">
          <Target className="h-3 w-3" />
          <span className="hidden sm:inline">Radar</span>
        </TabsTrigger>
        <TabsTrigger value="network" className="flex items-center gap-1">
          <Network className="h-3 w-3" />
          <span className="hidden sm:inline">Network</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="mt-0">
        <ChartInsights 
          sessions={sessions}
          selectedCategory={selectedCategory}
        />
      </TabsContent>
      
      <TabsContent value="timeline" className="mt-0">
        <TimelineInsights 
          sessions={sessions}
          selectedCategory={selectedCategory}
        />
      </TabsContent>
      
      <TabsContent value="radar" className="mt-0">
        <RadarInsights 
          sessions={sessions}
          selectedCategory={selectedCategory}
        />
      </TabsContent>
      
      <TabsContent value="network" className="mt-0">
        <NetworkInsights 
          sessions={sessions}
          selectedCategory={selectedCategory}
        />
      </TabsContent>
    </Tabs>
  );
};

export default EnhancedChartInsights;
