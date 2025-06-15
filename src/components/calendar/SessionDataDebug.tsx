
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimerSessionWithTimer } from "../../types";
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Bug, Database, Calendar, Clock } from 'lucide-react';

interface SessionDataDebugProps {
  sessions: TimerSessionWithTimer[];
  selectedDate?: Date;
}

const SessionDataDebug: React.FC<SessionDataDebugProps> = ({ sessions, selectedDate }) => {
  // Enhanced debugging statistics
  const totalSessions = sessions.length;
  const validSessions = sessions.filter(s => s.duration_ms && s.duration_ms > 0).length;
  const sessionsWithTimer = sessions.filter(s => s.timers?.name).length;
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
  
  // Recent sessions for debugging (last 10 with valid data)
  const recentSessions = sessions
    .filter(session => session.duration_ms && session.duration_ms > 0)
    .slice(0, 10);

  // Sessions by date (for debugging date filtering)
  const sessionsByDate = sessions.reduce((acc, session) => {
    if (session.start_time) {
      try {
        const date = format(parseISO(session.start_time), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
      } catch (error) {
        console.error('Error parsing session date:', session.start_time, error);
      }
    }
    return acc;
  }, {} as Record<string, TimerSessionWithTimer[]>);

  const datesWithSessions = Object.keys(sessionsByDate).sort().reverse();

  return (
    <Card className="glass-effect border-orange-200 bg-orange-50/50 mb-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
          <Bug className="h-4 w-4" />
          Session Data Debug & Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <Database className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <span className="text-muted-foreground block">Total Sessions</span>
            <Badge variant="outline" className="mt-1">{totalSessions}</Badge>
          </div>
          <div className="text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-green-600" />
            <span className="text-muted-foreground block">Valid Sessions</span>
            <Badge variant="outline" className="mt-1">{validSessions}</Badge>
          </div>
          <div className="text-center">
            <Calendar className="h-4 w-4 mx-auto mb-1 text-purple-600" />
            <span className="text-muted-foreground block">With Timers</span>
            <Badge variant="outline" className="mt-1">{sessionsWithTimer}</Badge>
          </div>
          <div className="text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-orange-600" />
            <span className="text-muted-foreground block">Total Time</span>
            <Badge variant="outline" className="mt-1">
              {(totalTime / 3600000).toFixed(1)}h
            </Badge>
          </div>
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="bg-white/50 p-2 rounded">
            <span className="text-muted-foreground">Selected Date Analysis:</span>
            <div className="mt-1">
              <Badge variant="secondary" className="mr-2">
                {format(selectedDate, 'yyyy-MM-dd (EEEE)')}
              </Badge>
              {sessionsByDate[format(selectedDate, 'yyyy-MM-dd')] ? (
                <span className="text-green-600">
                  {sessionsByDate[format(selectedDate, 'yyyy-MM-dd')].length} sessions found
                </span>
              ) : (
                <span className="text-red-600">No sessions found</span>
              )}
            </div>
          </div>
        )}

        {/* Recent Sessions Sample */}
        <div>
          <div className="text-muted-foreground mb-2 font-medium">Recent Valid Sessions (Sample):</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {recentSessions.slice(0, 5).map(session => (
              <div key={session.id} className="text-xs bg-white/50 p-2 rounded border">
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="font-mono text-xs">
                      {format(parseISO(session.start_time), 'MM/dd HH:mm')}
                    </span>
                  </div>
                  <div className="truncate">
                    {session.timers?.name || 'Unknown Timer'}
                  </div>
                  <div>
                    {((session.duration_ms || 0) / 60000).toFixed(0)}min
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {session.id.slice(0, 8)}...
                  </div>
                </div>
              </div>
            ))}
            {recentSessions.length === 0 && (
              <div className="text-red-600 italic">No valid sessions found</div>
            )}
          </div>
        </div>

        {/* Dates with Sessions */}
        <div>
          <div className="text-muted-foreground mb-2 font-medium">
            Dates with Sessions ({datesWithSessions.length} days):
          </div>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {datesWithSessions.slice(0, 10).map(date => (
              <Badge 
                key={date} 
                variant="outline" 
                className="text-xs"
                title={`${sessionsByDate[date].length} sessions`}
              >
                {date} ({sessionsByDate[date].length})
              </Badge>
            ))}
            {datesWithSessions.length > 10 && (
              <Badge variant="secondary" className="text-xs">
                +{datesWithSessions.length - 10} more
              </Badge>
            )}
          </div>
        </div>

        {/* Data Quality Issues */}
        {(totalSessions > 0 && validSessions === 0) && (
          <div className="bg-red-50 border border-red-200 p-2 rounded">
            <span className="text-red-700 font-medium">⚠️ Data Quality Issue:</span>
            <div className="text-red-600 text-xs mt-1">
              Found {totalSessions} sessions but none have valid duration data.
              This suggests a data integrity problem.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionDataDebug;
