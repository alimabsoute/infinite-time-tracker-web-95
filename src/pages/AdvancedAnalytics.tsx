
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useTimers } from '../hooks/useTimers';
import { useTimerSessions } from '../hooks/useTimerSessions';
import DateRangeVisualizationController from '../components/calendar/visualization/DateRangeVisualizationController';
import { formatTime } from '../components/calendar/CalendarUtils';

const AdvancedAnalytics = () => {
  const { timers } = useTimers();
  const { sessions, loading: sessionsLoading } = useTimerSessions();

  // Enhanced logging for debugging
  console.log('🔍 Advanced Analytics Page - Comprehensive data analysis:', {
    timersCount: timers.length,
    sessionsCount: sessions.length,
    sessionsLoading,
    
    // Timer analysis
    timerBreakdown: {
      total: timers.length,
      running: timers.filter(t => t.isRunning).length,
      stopped: timers.filter(t => !t.isRunning).length,
      withCategories: timers.filter(t => t.category).length,
      categories: [...new Set(timers.map(t => t.category).filter(Boolean))]
    },
    
    // Session analysis
    sessionBreakdown: {
      total: sessions.length,
      withDuration: sessions.filter(s => s.duration_ms && s.duration_ms > 0).length,
      withoutDuration: sessions.filter(s => !s.duration_ms || s.duration_ms <= 0).length,
      virtualSessions: sessions.filter(s => s.id.startsWith('virtual-')).length,
      realSessions: sessions.filter(s => !s.id.startsWith('virtual-')).length,
      withTimerData: sessions.filter(s => s.timers?.name).length,
      withoutTimerData: sessions.filter(s => !s.timers?.name).length
    },
    
    // Data quality checks
    dataQuality: {
      validSessions: sessions.filter(s => 
        s.duration_ms && 
        s.duration_ms > 0 && 
        s.timers?.name &&
        s.timer_id
      ).length,
      orphanedSessions: sessions.filter(s => !s.timers?.name || !s.timer_id).length,
      nullDurationSessions: sessions.filter(s => !s.duration_ms).length,
      zeroDurationSessions: sessions.filter(s => s.duration_ms === 0).length
    },
    
    // Sample data for inspection
    sampleTimer: timers[0] ? {
      id: timers[0].id,
      name: timers[0].name,
      category: timers[0].category,
      isRunning: timers[0].isRunning,
      elapsedTime: timers[0].elapsedTime
    } : null,
    
    sampleSession: sessions[0] ? {
      id: sessions[0].id,
      timer_id: sessions[0].timer_id,
      timer_name: sessions[0].timers?.name,
      duration_ms: sessions[0].duration_ms,
      start_time: sessions[0].start_time,
      end_time: sessions[0].end_time,
      isVirtual: sessions[0].id.startsWith('virtual-')
    } : null,
    
    // Running timer details
    runningTimerSessions: sessions
      .filter(s => s.id.startsWith('virtual-'))
      .map(s => ({
        id: s.id,
        timer_id: s.timer_id,
        timer_name: s.timers?.name,
        duration_ms: s.duration_ms,
        start_time: s.start_time
      }))
  });

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
    </PageLayout>
  );
};

export default AdvancedAnalytics;
