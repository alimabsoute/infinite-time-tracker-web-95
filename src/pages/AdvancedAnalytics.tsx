
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useTimers } from '../hooks/useTimers';
import { useTimerSessions } from '../hooks/useTimerSessions';
import DateRangeVisualizationController from '../components/calendar/visualization/DateRangeVisualizationController';
import { formatTime } from '../components/calendar/CalendarUtils';
import AnalysisSection from '../components/analytics/AnalysisSection';
import OptimizationTips from '../components/analytics/OptimizationTips';
import { PDFExportButton } from '@/components/ui/pdf-export-button';

const AdvancedAnalytics = () => {
  const { timers } = useTimers();
  const { sessions, loading: sessionsLoading } = useTimerSessions();

  if (sessionsLoading) {
    return (
      <PageLayout 
        title="Advanced Analytics"
        description="Explore your productivity patterns with interactive visualizations and detailed insights"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Advanced Analytics"
      description="Explore your productivity patterns with interactive visualizations and detailed insights"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Advanced Analytics</h1>
        <PDFExportButton 
          elementId="advanced-analytics-content" 
          fileName="advanced-analytics-export"
          className="ml-auto"
        />
      </div>

      <div id="advanced-analytics-content">
        <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">Data Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-muted-foreground">Total Timers</div>
            <div className="font-medium">{timers.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Running Timers</div>
            <div className="font-medium text-green-600">
              {timers.filter(t => t.isRunning).length}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Sessions</div>
            <div className="font-medium">{sessions.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Valid Sessions</div>
            <div className="font-medium text-blue-600">
              {sessions.filter(s => s.duration_ms && s.duration_ms > 0 && s.timers?.name).length}
            </div>
          </div>
        </div>
      </div>
      
      <DateRangeVisualizationController
        filteredTimers={timers}
        sessions={sessions}
        formatTime={formatTime}
      />
      
        {/* Always visible analysis sections */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalysisSection sessions={sessions} />
          <OptimizationTips sessions={sessions} />
        </div>
      </div>
    </PageLayout>
  );
};

export default AdvancedAnalytics;
