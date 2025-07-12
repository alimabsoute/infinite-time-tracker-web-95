
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

  return (
    <Card className="glass-effect border border-border/30 shadow-lg">
      <VisualizationHeader dataValidation={dataValidation} />
      <CardContent>
        <VisualizationTabs
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          has3DSupport={has3DSupport}
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
        />
      </CardContent>
    </Card>
  );
};

export default VisualizationContainer;
