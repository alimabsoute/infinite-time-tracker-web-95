
import React, { useState, useEffect } from 'react';
import { TimerSessionWithTimer } from "../../../types";
import DataValidator from './DataValidator';
import { Card, CardContent } from "@shared/components/ui/card";
import VisualizationHeader from './VisualizationHeader';
import VisualizationTabs from './VisualizationTabs';
import VisualizationRenderer from './VisualizationRenderer';

interface VisualizationContainerProps {
  sessions: TimerSessionWithTimer[];
  startDate: Date;
  endDate: Date;
  onBubbleClick?: (bubble: any) => void;
}

type VisualizationMode = 'timeline' | '2d' | 'treemap' | 'radar';

const VisualizationContainer: React.FC<VisualizationContainerProps> = ({
  sessions,
  startDate,
  endDate,
  onBubbleClick
}) => {
  const [currentMode, setCurrentMode] = useState<VisualizationMode>('timeline');
  const [dataValidation, setDataValidation] = useState<any>(null);
  const [fallbackHistory, setFallbackHistory] = useState<VisualizationMode[]>([]);

  // Validate data on props change
  useEffect(() => {
    const validation = DataValidator.validateSessionsForDateRange(sessions, startDate, endDate);
    setDataValidation(validation);
    
  }, [sessions, startDate, endDate]);

  const handleVisualizationError = (error: Error, mode: VisualizationMode) => {
    console.error(`VisualizationContainer - ${mode} visualization error:`, error);
    
    // Track fallback history to prevent infinite loops
    const newFallbackHistory = [...fallbackHistory, mode];
    setFallbackHistory(newFallbackHistory);
    
    // Progressive fallback logic
    if (mode === 'timeline' && !newFallbackHistory.includes('2d')) {
      setCurrentMode('2d');
    } else if ((mode === '2d' || mode === 'timeline') && !newFallbackHistory.includes('treemap')) {
      setCurrentMode('treemap');
    } else if (!newFallbackHistory.includes('radar')) {
      setCurrentMode('radar');
    } else {
    }
  };

  // Manual mode selection with fallback tracking reset
  const handleModeChange = (newMode: VisualizationMode) => {
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

      </CardContent>
    </Card>
  );
};

export default VisualizationContainer;
