
import React from 'react';
import Navigation from '../components/layout/Navigation';
import CalendarContent from '@features/calendar/components/CalendarContent';
import { useDeadSimpleTimers } from '@features/timer/hooks/useDeadSimpleTimers';
import { supabase } from '@shared/lib/supabase/client';
import { PDFExportButton } from '@shared/components/ui/pdf-export-button';

const Calendar = () => {
  const { timers } = useDeadSimpleTimers();
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = React.useState(true);

  // Fetch sessions for calendar with debounced updates
  React.useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Get ALL sessions (completed and running)
        const { data, error } = await supabase
          .from('timer_sessions')
          .select(`
            *,
            timers!inner(
              id,
              name,
              category,
              elapsed_time,
              is_running,
              start_time
            )
          `)
          .order('start_time', { ascending: false });

        if (error) throw error;
        
        // Process sessions - but don't calculate virtual durations on every render
        const processedSessions = (data || []).map(session => {
          // For running timers, use stored elapsed_time instead of calculating
          if (!session.end_time && session.timers?.is_running) {
            return {
              ...session,
              duration_ms: session.timers.elapsed_time || 0,
              isVirtual: true
            };
          }
          return session;
        });

        setSessions(processedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchSessions();
    
    // Only subscribe to session changes, not timer changes to reduce re-renders
    const subscription = supabase
      .channel('timer_sessions_calendar')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'timer_sessions' },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [timers.length]); // Only depend on timers length, not full timers array
  
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [categoryFilter, setCategoryFilter] = React.useState('all');

  // Use only real sessions - no mock data
  const displaySessions = sessions;

  // Memoize month change handler to prevent unnecessary re-renders
  const handleMonthChange = React.useCallback((direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  }, [currentMonth]);

  // Get unique categories from timers
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(timers.map(timer => timer.category || 'Uncategorized'))
    );
    return uniqueCategories.sort();
  }, [timers]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main role="main" aria-label="Main content">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Calendar</h1>
            <PDFExportButton 
              elementId="calendar-content" 
              fileName="calendar-export"
              className="ml-auto"
            />
          </div>
          
          <div id="calendar-content">
            <CalendarContent
          currentMonth={currentMonth}
          handleMonthChange={handleMonthChange}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setCurrentMonth={setCurrentMonth}
          timers={timers}
          sessions={displaySessions}
          sessionsLoading={sessionsLoading}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
