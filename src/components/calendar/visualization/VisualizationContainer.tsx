
import React, { useState, useEffect } from 'react';
import { TimerSessionWithTimer } from "../../../types";
import DataValidator from './DataValidator';
import { Card, CardContent } from "@/components/ui/card";
import VisualizationHeader from './VisualizationHeader';
import VisualizationTabs from './VisualizationTabs';
import VisualizationRenderer from './VisualizationRenderer';
import VisualizationDebugInfo from './VisualizationDebugInfo';

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
  const [fallbackHistory, setFallbackHistory] = useState<VisualizationMode[]>([]);

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
      setFallbackHistory(['3d']);
    }
  }, []);

  // Validate data on props change
  useEffect(() => {
    const validation = DataValidator.validateSessions(sessions, currentWeekStart);
    setDataValidation(validation);
    
    console.log('🔍 VisualizationContainer - Data validation:', validation);
  }, [sessions, currentWeekStart]);

  const handleVisualizationError = (error: Error, mode: VisualizationMode) => {
    console.error(`🔍 VisualizationContainer - ${mode} visualization error:`, error);
    
    // Track fallback history to prevent infinite loops
    const newFallbackHistory = [...fallbackHistory, mode];
    setFallbackHistory(newFallbackHistory);
    
    // Progressive fallback logic
    if (mode === '3d' && !newFallbackHistory.includes('2d')) {
      console.log('🔍 VisualizationContainer - Auto-falling back from 3D to 2D');
      setCurrentMode('2d');
    } else if ((mode === '2d' || mode === '3d') && !newFallbackHistory.includes('bar')) {
      console.log('🔍 VisualizationContainer - Auto-falling back to Bar Chart');
      setCurrentMode('bar');
    } else {
      console.log('🔍 VisualizationContainer - All fallbacks exhausted');
    }
  };

  // Manual mode selection with fallback tracking reset
  const handleModeChange = (newMode: VisualizationMode) => {
    console.log('🔍 VisualizationContainer - Manual mode change to:', newMode);
    setCurrentMode(newMode);
    setFallbackHistory([]); // Reset fallback history on manual selection
  };

  return (
    <Card className="glass-effect border border-border/30 shadow-lg">
      <VisualizationHeader 
        dataValidation={dataValidation}
        fallbackHistory={fallbackHistory}
      />
      <CardContent>
        <VisualizationTabs
          currentMode={currentMode}
          onModeChange={handleModeChange}
          has3DSupport={has3DSupport}
          fallbackHistory={fallbackHistory}
        >
          <VisualizationRenderer
            mode={currentMode}
            sessions={sessions}
            currentWeekStart={currentWeekStart}
            hasValidData={dataValidation?.hasValidData || false}
            onBubbleClick={onBubbleClick}
            onVisualizationError={handleVisualizationError}
          />
        </VisualizationTabs>

        <VisualizationDebugInfo
          currentMode={currentMode}
          has3DSupport={has3DSupport}
          dataValidation={dataValidation}
          fallbackHistory={fallbackHistory}
        />
      </CardContent>
    </Card>
  );
};

export default VisualizationContainer;
