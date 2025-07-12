
import React, { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import { TimerSessionWithTimer } from "../../../types";
import DataValidator from './DataValidator';
import { Card, CardContent } from "@/components/ui/card";
import VisualizationHeader from './VisualizationHeader';
import VisualizationTabs from './VisualizationTabs';
import VisualizationRenderer from './VisualizationRenderer';
import VisualizationDebugInfo from './VisualizationDebugInfo';
import DateRangePicker from '../DateRangePicker';

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
  
  // Date range state - default to past week
  const [startDate, setStartDate] = useState(() => subDays(new Date(), 6));
  const [endDate, setEndDate] = useState(() => new Date());

  console.log('🔍 VisualizationContainer - Initializing with:', {
    sessionsCount: sessions.length,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
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

  // Handle date range changes
  const handleDateRangeChange = (newStartDate: Date, newEndDate: Date) => {
    console.log('🔍 VisualizationContainer - Date range changed:', {
      startDate: newStartDate.toISOString(),
      endDate: newEndDate.toISOString()
    });
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setFallbackHistory([]); // Reset fallback history on date change
  };

  return (
    <Card className="glass-effect border border-border/30 shadow-lg">
      <VisualizationHeader 
        dataValidation={dataValidation}
        fallbackHistory={fallbackHistory}
        dateRange={{ startDate, endDate }}
      />
      <CardContent>
        {/* Date Range Picker */}
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Select Date Range</h4>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        <VisualizationTabs
          currentMode={currentMode}
          onModeChange={handleModeChange}
          has3DSupport={has3DSupport}
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
          has3DSupport={has3DSupport}
          dataValidation={dataValidation}
          fallbackHistory={fallbackHistory}
          dateRange={{ startDate, endDate }}
        />
      </CardContent>
    </Card>
  );
};

export default VisualizationContainer;
