import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, ScatterChart, LayoutGrid, Radar, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

type VisualizationMode = 'timeline' | '2d' | 'treemap' | 'radar';

interface VisualizationTabsProps {
  currentMode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
  fallbackHistory?: string[];
  children: React.ReactNode;
}

const VisualizationTabs: React.FC<VisualizationTabsProps> = ({
  currentMode,
  onModeChange,
  fallbackHistory = [],
  children
}) => {
  const tabConfigs = [
    {
      value: 'timeline' as const,
      label: 'Timeline',
      icon: TrendingUp,
      disabled: false,
      failed: fallbackHistory.includes('timeline')
    },
    {
      value: '2d' as const,
      label: '2D Bubbles',
      icon: ScatterChart,
      disabled: false,
      failed: fallbackHistory.includes('2d')
    },
    {
      value: 'treemap' as const,
      label: 'Treemap',
      icon: LayoutGrid,
      disabled: false,
      failed: fallbackHistory.includes('treemap')
    },
    {
      value: 'radar' as const,
      label: 'Radar Chart',
      icon: Radar,
      disabled: false,
      failed: fallbackHistory.includes('radar')
    }
  ];

  return (
    <Tabs value={currentMode} onValueChange={(value) => onModeChange(value as VisualizationMode)}>
      <TabsList className="grid w-full grid-cols-4 mb-4">
        {tabConfigs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
              className={`flex items-center gap-2 ${tab.failed ? 'opacity-60' : ''}`}
            >
              <TabIcon size={14} />
              {tab.label}
              {tab.failed && <AlertCircle size={12} className="text-red-500" />}
              {tab.disabled && <Badge variant="outline" className="text-xs ml-1">N/A</Badge>}
            </TabsTrigger>
          );
        })}
      </TabsList>
      
      <TabsContent value={currentMode} className="mt-0">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default VisualizationTabs;