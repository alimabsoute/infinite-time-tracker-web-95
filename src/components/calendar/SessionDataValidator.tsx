
import React from 'react';
import { TimerSessionWithTimer } from '../../types';
import { parseISO, isValid, format } from 'date-fns';

interface SessionDataValidatorProps {
  sessions: TimerSessionWithTimer[];
  onValidationComplete: (validSessions: TimerSessionWithTimer[], stats: ValidationStats) => void;
}

interface ValidationStats {
  totalSessions: number;
  validSessions: number;
  invalidSessions: number;
  errors: string[];
  warnings: string[];
}

const SessionDataValidator: React.FC<SessionDataValidatorProps> = ({
  sessions,
  onValidationComplete
}) => {
  React.useEffect(() => {
    const stats: ValidationStats = {
      totalSessions: sessions.length,
      validSessions: 0,
      invalidSessions: 0,
      errors: [],
      warnings: []
    };

    const validSessions: TimerSessionWithTimer[] = [];


    sessions.forEach((session, index) => {
      const sessionId = session.id || `session-${index}`;
      
      // Validate required fields
      if (!session.start_time) {
        stats.errors.push(`Session ${sessionId}: Missing start_time`);
        stats.invalidSessions++;
        return;
      }

      if (!session.user_id) {
        stats.errors.push(`Session ${sessionId}: Missing user_id`);
        stats.invalidSessions++;
        return;
      }

      if (!session.timer_id) {
        stats.errors.push(`Session ${sessionId}: Missing timer_id`);
        stats.invalidSessions++;
        return;
      }

      // Validate start_time format
      try {
        const startDate = parseISO(session.start_time);
        if (!isValid(startDate)) {
          stats.errors.push(`Session ${sessionId}: Invalid start_time format: ${session.start_time}`);
          stats.invalidSessions++;
          return;
        }

        // Check for future dates
        if (startDate > new Date()) {
          stats.warnings.push(`Session ${sessionId}: Future start_time: ${session.start_time}`);
        }

        // Check for very old dates (more than 2 years ago)
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        if (startDate < twoYearsAgo) {
          stats.warnings.push(`Session ${sessionId}: Very old start_time: ${session.start_time}`);
        }

      } catch (error) {
        stats.errors.push(`Session ${sessionId}: Date parsing error: ${error}`);
        stats.invalidSessions++;
        return;
      }

      // Validate duration
      if (session.duration_ms !== null && session.duration_ms !== undefined) {
        if (typeof session.duration_ms !== 'number' || session.duration_ms < 0) {
          stats.warnings.push(`Session ${sessionId}: Invalid duration_ms: ${session.duration_ms}`);
        }

        if (session.duration_ms > 24 * 60 * 60 * 1000) { // More than 24 hours
          stats.warnings.push(`Session ${sessionId}: Unusually long duration: ${Math.round(session.duration_ms / 3600000)}h`);
        }
      }

      // Validate timer relationship
      if (!session.timers) {
        stats.warnings.push(`Session ${sessionId}: Missing timer relationship`);
      }

      // If we get here, the session is valid
      validSessions.push(session);
      stats.validSessions++;
    });

      ...stats,
      validationRate: `${((stats.validSessions / stats.totalSessions) * 100).toFixed(1)}%`
    });

    if (stats.errors.length > 0) {
      console.error('SessionDataValidator - Errors found:', stats.errors);
    }

    if (stats.warnings.length > 0) {
      console.warn('SessionDataValidator - Warnings:', stats.warnings);
    }

    onValidationComplete(validSessions, stats);
  }, [sessions, onValidationComplete]);

  return null; // This is a utility component with no UI
};

export default SessionDataValidator;
