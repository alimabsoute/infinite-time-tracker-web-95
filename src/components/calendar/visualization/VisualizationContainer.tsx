
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TimerSessionWithTimer } from "../../../types";
import BubbleChart3DEnhanced from './BubbleChart3DEnhanced';
import Fallback2DChart from './Fallback2DChart';
import FallbackBarChart from './FallbackBarChart';
import DataValidator from './DataValidator';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, BarChart3, CircleDot } from 'lucide-react';

interface VisualizationContainerProps {
  sessions: TimerSessionWithTimer[];
  currentWeekStart: Date;
  onBubbleClick?: (bubble: any) => void;
}

type VisualizationMode = '3d' | '2d' | 'bar';

const VisualizationContainer: React.FC<VisualizationContainerProps> = ({
  sessions,
  currentWeekStart,
  onBubbleClick
}) => {
  const [currentMode, setCurrentMode] = useState<VisualizationMode>('3d');
  const [has3DSupport, setHas3DSupport] = useState(true);
  const [dataValidation, setDataValidation] = useState<any>(null);

  console.log('🔍 VisualizationContainer - Initializing with:', {
    sessionsCount: sessions.length,
    currentWeekStart: currentWeekStart.toISOString(),
    currentMode
  });

  // Check for WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const webglSupported = !!gl;
    
    console.log('🔍 VisualizationContainer - WebGL support:', webglSupported);
    
    if (!webglSupported) {
      setHas3DSupport(false);
      setCurrentMode('2d');
    }
  }, []);

  // Validate data on props change
  useEffect(() => {
    const validation = DataValidator.validateSessions(sessions, currentWeekStart);
    setDataValidation(validation);
    
    console.log('🔍 VisualizationContainer - Data validation:', validation);
    
    // Auto-fallback to 2D if no valid data for 3D
    if (!validation.hasValidData && currentMode === '3d') {
      console.log('🔍 VisualizationContainer - Auto-falling back to 2D due to invalid data');
      setCurrentMode('2d');
    }
  }, [sessions, currentWeekStart, currentMode]);

  const handleVisualizationError = (error: Error, mode: VisualizationMode) => {
    console.error(`🔍 VisualizationContainer - ${mode} visualization error:`, error);
    
    // Progressive fallback
    if (mode === '3d' && has3DSupport) {
      console.log('🔍 VisualizationContainer - Falling back from 3D to 2D');
      setCurrentMode('2d');
    } else if (mode === '2d') {
      console.log('🔍 VisualizationContainer - Falling back from 2D to Bar');
      setCurrentMode('bar');
    }
  };

  const renderVisualization = () => {
    if (!dataValidation?.hasValidData) {
      return (
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p>No timer data available for this week</p>
            <p className="text-sm mt-2">Create some timers and log time to see visualizations</p>
            <p className="text-xs mt-4 text-slate-400">Sessions: {sessions.length}</p>
          </div>
        </div>
      );
    }

    try {
      switch (currentMode) {
        case '3d':
          return (
            <BubbleChart3DEnhanced
              sessions={sessions}
              currentWeekStart={currentWeekStart}
              onBubbleClick={onBubbleClick}
              onError={(error) => handleVisualizationError(error, '3d')}
            />
          );
        case '2d':
          return (
            <Fallback2DChart
              sessions={sessions}
              currentWeekStart={currentWeekStart}
              onBubbleClick={onBubbleClick}
              onError={(error) => handleVisualizationError(error, '2d')}
            />
          );
        case 'bar':
          return (
            <FallbackBarChart
              sessions={sessions}
              currentWeekStart={currentWeekStart}
              onBubbleClick={onBubbleClick}
            />
          );
        default:
          return (
            <div className="h-[400px] flex items-center justify-center text-red-500">
              <p>Visualization mode not supported</p>
            </div>
          );
      }
    } catch (error) {
      console.error('🔍 VisualizationContainer - Render error:', error);
      handleVisualizationError(error as Error, currentMode);
      return (
        <div className="h-[400px] flex items-center justify-center text-red-500">
          <p>Error rendering visualization</p>
        </div>
      );
    }
  };

  return (
    <Card className="glass-effect border border-border/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weekly Activity Visualization</span>
          <div className="text-sm text-muted-foreground">
            Data: {dataValidation?.validSessionsCount || 0} sessions
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={currentMode} onValueChange={(value) => setCurrentMode(value as VisualizationMode)}>
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
              {renderVisualization()}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && dataValidation && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <strong>Debug:</strong> Mode: {currentMode}, 3D Support: {has3DSupport ? 'Yes' : 'No'}, 
            Valid Sessions: {dataValidation.validSessionsCount}, 
            Timer Groups: {dataValidation.timerGroupsCount}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualizationContainer;
