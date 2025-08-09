
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
  startDate: Date;
  endDate: Date;
  onBubbleClick?: (bubble: any) => void;
}

type VisualizationMode = 'timeline' | '2d' | 'bar';

const VisualizationContainer: React.FC<VisualizationContainerProps> = ({
  sessions,
  startDate,
  endDate,
  onBubbleClick
}) => {
  const [currentMode, setCurrentMode] = useState<VisualizationMode>('timeline');
  // Removed 3D support tracking as we no longer use 3D
  const [dataValidation, setDataValidation] = useState<any>(null);
  const [fallbackHistory, setFallbackHistory] = useState<VisualizationMode[]>([]);

  console.log('🔍 VisualizationContainer - Initializing with:', {
    sessionsCount: sessions.length,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    currentMode
  });

  // Removed WebGL support check as we no longer use 3D visualization

  // Validate data on props change
  useEffect(() => {
    const validation = DataValidator.validateSessionsForDateRange(sessions, startDate, endDate);
    setDataValidation(validation);
    
    console.log('🔍 VisualizationContainer - Data validation:', validation);
  }, [sessions, startDate, endDate]);

  const handleVisualizationError = (error: Error, mode: VisualizationMode) => {
    console.error(`🔍 VisualizationContainer - ${mode} visualization error:`, error);
    
    // Track fallback history to prevent infinite loops
    const newFallbackHistory = [...fallbackHistory, mode];
    setFallbackHistory(newFallbackHistory);
    
    // Progressive fallback logic
    if (mode === 'timeline' && !newFallbackHistory.includes('2d')) {
      console.log('🔍 VisualizationContainer - Auto-falling back from Timeline to 2D');
      setCurrentMode('2d');
    } else if ((mode === '2d' || mode === 'timeline') && !newFallbackHistory.includes('bar')) {
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
        dateRange={{ startDate, endDate }}
      />
      <CardContent>
        <VisualizationTabs
          currentMode={currentMode}
          onModeChange={handleModeChange}
          fallbackHistory={fallbackHistory}
        >
          <VisualizationRenderer
            mode={currentMode}
            sessions={sessions}
            startDate={startDate}
            endDate={endDate}
            hasValidData={dataValidation?.hasValidData || false}
            onBubbleClick={onBubbleClick}
            onVisualizationError={handleVisualizationError}
          />
        </VisualizationTabs>

        <VisualizationDebugInfo
          currentMode={currentMode}
          has3DSupport={false}
          dataValidation={dataValidation}
          fallbackHistory={fallbackHistory}
          dateRange={{ startDate, endDate }}
        />
      </CardContent>
    </Card>
  );
};

export default VisualizationContainer;
