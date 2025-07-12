
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useTimers } from '../hooks/useTimers';
import { useTimerSessions } from '../hooks/useTimerSessions';
import DateRangeVisualizationController from '../components/calendar/visualization/DateRangeVisualizationController';
import { formatTime } from '../components/calendar/CalendarUtils';

const AdvancedAnalytics = () => {
  const { timers } = useTimers();
  const { sessions, loading: sessionsLoading } = useTimerSessions();

  console.log('🔍 Advanced Analytics Page - Data summary:', {
    timersCount: timers.length,
    sessionsCount: sessions.length,
    sessionsLoading,
    sampleTimer: timers[0]?.name || 'No timers',
    sampleSession: sessions[0] ? {
      id: sessions[0].id,
      timer_name: sessions[0].timers?.name || 'No name',
      duration_ms: sessions[0].duration_ms,
      start_time: sessions[0].start_time
    } : 'No sessions'
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
      <DateRangeVisualizationController
        filteredTimers={timers}
        sessions={sessions}
        formatTime={formatTime}
      />
    </PageLayout>
  );
};

export default AdvancedAnalytics;
