
import React from 'react';
import { useTimers } from '../hooks/useTimers';
import { useTimerSessions } from '../hooks/useTimerSessions';
import PageLayout from '../components/layout/PageLayout';
import QuickInsightsDashboard from '../components/insights/QuickInsightsDashboard';

const Insights = () => {
  const { timers, loading } = useTimers();
  const { sessions } = useTimerSessions();

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Quick Insights"
      description="Get actionable insights about your productivity patterns and performance"
    >
      <QuickInsightsDashboard timers={timers} sessions={sessions} />
    </PageLayout>
  );
};

export default Insights;
