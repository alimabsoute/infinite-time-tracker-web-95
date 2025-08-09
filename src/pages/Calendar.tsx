
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import CalendarContent from '../components/calendar/CalendarContent';
import { useDeadSimpleTimers } from '../hooks/useDeadSimpleTimers';
import { supabase } from '@/integrations/supabase/client';

const Calendar = () => {
  const { timers } = useDeadSimpleTimers();
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = React.useState(true);
  
  // Emergency mock data when no sessions exist
  const [useMockData, setUseMockData] = React.useState(false);

  // Fetch sessions for calendar with real-time updates
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
        
        // Process sessions to include running timer data
        const processedSessions = (data || []).map(session => {
          // For running timers without end_time, calculate virtual duration
          if (!session.end_time && session.timers?.is_running) {
            const now = new Date();
            const sessionStart = new Date(session.start_time);
            const virtualDuration = now.getTime() - sessionStart.getTime();
            
            return {
              ...session,
              duration_ms: virtualDuration,
              isVirtual: true
            };
          }
          return session;
        });

        console.log('📅 Calendar - Fetched sessions:', {
          total: processedSessions.length,
          completed: processedSessions.filter(s => s.end_time).length,
          running: processedSessions.filter(s => !s.end_time && s.timers?.is_running).length,
          sampleSessions: processedSessions.slice(0, 3).map(s => ({
            id: s.id,
            timer_name: s.timers?.name,
            duration_ms: s.duration_ms,
            has_end_time: !!s.end_time
          }))
        });
        
        // If no sessions found, enable mock data for development/testing
        if (processedSessions.length === 0 && timers.length > 0) {
          console.log('📅 Calendar - No sessions found, enabling mock data');
          setUseMockData(true);
        }
        
        setSessions(processedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchSessions();
    
    // Set up real-time subscription for session updates
    const subscription = supabase
      .channel('timer_sessions_calendar')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'timer_sessions' },
        () => {
          console.log('📅 Calendar - Session updated, refetching...');
          fetchSessions();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'timers' },
        () => {
          console.log('📅 Calendar - Timer updated, refetching sessions...');
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [timers]);
  
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [categoryFilter, setCategoryFilter] = React.useState('all');

  // Generate mock data when needed for testing/development
  const displaySessions = React.useMemo(() => {
    if (sessions.length > 0 || !useMockData) {
      return sessions;
    }
    
    // Generate mock sessions when no real data exists
    const { generateMockSessionsForCalendar } = require('../utils/mockCalendarData');
    return generateMockSessionsForCalendar(timers);
  }, [sessions, useMockData, timers]);

  console.log('🔍 Calendar Page - Data summary:', {
    timersCount: timers.length,
    sessionsCount: sessions.length,
    sessionsLoading,
    selectedDate: selectedDate?.toISOString(),
    sampleTimer: timers[0]?.name || 'No timers',
    sampleSession: sessions[0] ? {
      id: sessions[0].id,
      timer_name: sessions[0].timers?.name || 'No name',
      duration_ms: sessions[0].duration_ms,
      start_time: sessions[0].start_time,
      has_end_time: !!sessions[0].end_time
    } : 'No sessions',
    monthSessions: displaySessions.filter(s => {
      const sessionDate = new Date(s.start_time);
      return sessionDate.getMonth() === currentMonth.getMonth() && 
             sessionDate.getFullYear() === currentMonth.getFullYear();
    }).length
  });

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  // Get unique categories from timers
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(timers.map(timer => timer.category || 'Uncategorized'))
    );
    return uniqueCategories.sort();
  }, [timers]);

  return (
    <PageLayout 
      title="Calendar View"
      description="View your timer sessions and productivity patterns in a traditional calendar format"
    >
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
    </PageLayout>
  );
};

export default Calendar;
