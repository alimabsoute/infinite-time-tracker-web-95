
import React from 'react';
import { useDeadSimpleTimers } from '../hooks/useDeadSimpleTimers';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '../components/layout/PageLayout';
import QuickInsightsDashboard from '../components/insights/QuickInsightsDashboard';
import { PDFExportButton } from '@/components/ui/pdf-export-button';

const Insights = () => {
  const { timers, loading } = useDeadSimpleTimers();
  const [sessions, setSessions] = React.useState<any[]>([]);

  // Fetch sessions for insights
  React.useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from('timer_sessions')
          .select(`
            *,
            timers!inner(
              id,
              name,
              category
            )
          `)
          .not('end_time', 'is', null)
          .order('start_time', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]);
      }
    };

    fetchSessions();
  }, []);

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quick Insights</h1>
        <PDFExportButton 
          elementId="insights-content" 
          fileName="insights-export"
          className="ml-auto"
        />
      </div>

      <div id="insights-content">
        <QuickInsightsDashboard timers={timers} sessions={sessions} />
      </div>
    </PageLayout>
  );
};

export default Insights;
