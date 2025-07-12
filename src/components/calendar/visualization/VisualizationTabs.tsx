
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, BarChart3, CircleDot } from 'lucide-react';
import { motion } from 'framer-motion';

type VisualizationMode = '3d' | '2d' | 'bar';

interface VisualizationTabsProps {
  currentMode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
  has3DSupport: boolean;
  children: React.ReactNode;
}

export const VisualizationTabs: React.FC<VisualizationTabsProps> = ({
  currentMode,
  onModeChange,
  has3DSupport,
  children
}) => {
  return (
    <Tabs value={currentMode} onValueChange={(value) => onModeChange(value as VisualizationMode)}>
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="3d" disabled={!has3DSupport}>
          <Box className="mr-2 h-4 w-4" />
          3D Bubbles
        </TabsTrigger>
        <TabsTrigger value="2d">
          <CircleDot className="mr-2 h-4 w-4" />
          2D Scatter
        </TabsTrigger>
        <TabsTrigger value="bar">
          <BarChart3 className="mr-2 h-4 w-4" />
          Bar Chart
        </TabsTrigger>
      </TabsList>

      <TabsContent value={currentMode} className="mt-0">
        <motion.div
          key={currentMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </TabsContent>
    </Tabs>
  );
};

export default VisualizationTabs;
