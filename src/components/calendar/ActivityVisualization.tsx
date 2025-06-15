
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer, TimerSessionWithTimer } from "../../types";
import ProductivityInsights from './ProductivityInsights';
import TimeHeatmap from './TimeHeatmap';
import CategoryPerformance from './CategoryPerformance';
import TrendAnalysis from './TrendAnalysis';
import FocusAnalytics from './FocusAnalytics';
import ProductivityHeatmap from './ProductivityHeatmap';
import { BarChart3, TrendingUp, PieChart, Zap, Target, Calendar } from 'lucide-react';

interface ActivityVisualizationProps {
  filteredTimers: Timer[];
  sessions: TimerSessionWithTimer[];
  formatTime: (ms: number) => string;
}

const ActivityVisualization: React.FC<ActivityVisualizationProps> = ({
  filteredTimers,
  sessions,
  formatTime
}) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="focus" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Focus
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Heatmap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6">
          <ProductivityInsights timers={filteredTimers} formatTime={formatTime} />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryPerformance timers={filteredTimers} formatTime={formatTime} />
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <TrendAnalysis timers={filteredTimers} formatTime={formatTime} />
        </TabsContent>

        <TabsContent value="patterns" className="mt-6">
          <TimeHeatmap sessions={sessions} formatTime={formatTime} />
        </TabsContent>

        <TabsContent value="focus" className="mt-6">
          <FocusAnalytics timers={filteredTimers} formatTime={formatTime} />
        </TabsContent>

        <TabsContent value="heatmap" className="mt-6">
          <ProductivityHeatmap timers={filteredTimers} formatTime={formatTime} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityVisualization;
