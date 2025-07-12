import { TimerSessionWithTimer } from "../../../types";
import { isWithinInterval } from 'date-fns';

export interface ValidationResult {
  hasValidData: boolean;
  validSessionsCount: number;
  timerGroupsCount: number;
  dateRangeSessions: TimerSessionWithTimer[];
  timerGroups: Record<string, any>;
  errors: string[];
}

class DataValidator {
  static validateSessions(sessions: TimerSessionWithTimer[], currentWeekStart: Date): ValidationResult {
    // Keep backward compatibility - default to 7 days from currentWeekStart
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    
    return this.validateSessionsForDateRange(sessions, currentWeekStart, endDate);
  }

  static validateSessionsForDateRange(sessions: TimerSessionWithTimer[], startDate: Date, endDate: Date): ValidationResult {
    const errors: string[] = [];
    
    console.log('🔍 DataValidator - Starting validation:', {
      totalSessions: sessions.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Basic validation
    if (!sessions || !Array.isArray(sessions)) {
      errors.push('Sessions is not a valid array');
      return {
        hasValidData: false,
        validSessionsCount: 0,
        timerGroupsCount: 0,
        dateRangeSessions: [],
        timerGroups: {},
        errors
      };
    }

    if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
      errors.push('Invalid date range');
      return {
        hasValidData: false,
        validSessionsCount: 0,
        timerGroupsCount: 0,
        dateRangeSessions: [],
        timerGroups: {},
        errors
      };
    }

    // Filter sessions for date range
    const rangeInterval = { start: startDate, end: endDate };
    
    const dateRangeSessions = sessions.filter(session => {
      if (!session.start_time) return false;
      
      try {
        const sessionDate = new Date(session.start_time);
        return isWithinInterval(sessionDate, rangeInterval);
      } catch (error) {
        console.warn('🔍 DataValidator - Invalid session date:', session.start_time);
        return false;
      }
    });

    console.log('🔍 DataValidator - Date range filtering:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      dateRangeSessions: dateRangeSessions.length
    });

    // Validate and group sessions by timer
    const timerGroups: Record<string, any> = {};
    let validSessionsCount = 0;

    dateRangeSessions.forEach(session => {
      // Enhanced timer name extraction
      let timerName: string | undefined;
      let category = 'Uncategorized';
      
      // Primary: joined timer data
      if (session.timers && typeof session.timers === 'object' && session.timers.name) {
        timerName = session.timers.name;
        category = session.timers.category || 'Uncategorized';
      }
      // Fallback: direct properties
      else if ((session as any).timer_name) {
        timerName = (session as any).timer_name;
        category = (session as any).timer_category || 'Uncategorized';
      }
      // Last resort: try common field names
      else {
        const possibleFields = ['name', 'timer', 'title'];
        for (const field of possibleFields) {
          if ((session as any)[field] && typeof (session as any)[field] === 'string') {
            timerName = (session as any)[field];
            break;
          }
        }
      }

      if (!timerName || typeof timerName !== 'string' || timerName.trim() === '') {
        console.warn('🔍 DataValidator - Session without valid timer name:', {
          sessionId: session.id,
          hasTimers: !!session.timers,
          sessionKeys: Object.keys(session)
        });
        return;
      }

      // Validate duration
      let duration = 0;
      if (session.duration_ms && typeof session.duration_ms === 'number' && session.duration_ms > 0) {
        duration = session.duration_ms;
      } else if (session.end_time && session.start_time) {
        const startTime = new Date(session.start_time).getTime();
        const endTime = new Date(session.end_time).getTime();
        if (endTime > startTime) {
          duration = endTime - startTime;
        }
      }

      if (duration <= 0) {
        console.warn('🔍 DataValidator - Session with invalid duration:', {
          sessionId: session.id,
          duration_ms: session.duration_ms,
          start_time: session.start_time,
          end_time: session.end_time
        });
        return;
      }

      // Valid session - add to group
      validSessionsCount++;
      
      if (!timerGroups[timerName]) {
        timerGroups[timerName] = {
          sessions: [],
          totalTime: 0,
          category,
          createdAt: new Date(session.start_time),
          timerId: session.timer_id || session.id
        };
      }

      timerGroups[timerName].sessions.push(session);
      timerGroups[timerName].totalTime += duration;
    });

    const timerGroupsCount = Object.keys(timerGroups).length;
    const hasValidData = validSessionsCount > 0 && timerGroupsCount > 0;

    console.log('🔍 DataValidator - Validation complete:', {
      hasValidData,
      validSessionsCount,
      timerGroupsCount,
      errors: errors.length
    });

    return {
      hasValidData,
      validSessionsCount,
      timerGroupsCount,
      dateRangeSessions,
      timerGroups,
      errors
    };
  }

  static extractTimerName(session: TimerSessionWithTimer): string | null {
    // Primary source: joined timer data
    if (session.timers && typeof session.timers === 'object' && session.timers.name) {
      return session.timers.name;
    }
    
    // Fallback: direct properties
    if ((session as any).timer_name) {
      return (session as any).timer_name;
    }
    
    // Last resort: try common field names
    const possibleFields = ['name', 'timer', 'title'];
    for (const field of possibleFields) {
      if ((session as any)[field] && typeof (session as any)[field] === 'string') {
        return (session as any)[field];
      }
    }
    
    return null;
  }
}

export default DataValidator;
