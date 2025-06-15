
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimerSessionWithTimer } from "../../types";
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Bug } from 'lucide-react';

interface SessionDataDebugProps {
  sessions: TimerSessionWithTimer[];
  selectedDate?: Date;
}

const SessionDataDebug: React.FC<SessionDataDebugProps> = ({ sessions, selectedDate }) => {
  // Sample of recent sessions for debugging
  const recentSessions = sessions
    .filter(session => session.duration_ms && session.duration_ms > 0)
    .slice(0, 10);

  const totalSessions = sessions.length;
  const validSessions = sessions.filter(s => s.duration_ms && s.duration_ms > 0).length;
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);

  return (
    <Card className="glass-effect border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
          <Bug className="h-4 w-4" />
          Session Data Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-muted-foreground">Total Sessions:</span>
            <Badge variant="outline" className="ml-1">{totalSessions}</Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Valid Sessions:</span>
            <Badge variant="outline" className="ml-1">{validSessions}</Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Total Time:</span>
            <Badge variant="outline" className="ml-1">
              {(totalTime / 3600000).toFixed(1)}h
            </Badge>
          </div>
        </div>

        {selectedDate && (
          <div>
            <span className="text-muted-foreground">Selected Date:</span>
            <Badge variant="secondary" className="ml-1">
              {format(selectedDate, 'yyyy-MM-dd')}
            </Badge>
          </div>
        )}

        <div>
          <div className="text-muted-foreground mb-2">Recent Sessions Sample:</div>
          <div className="space-y-1">
            {recentSessions.slice(0, 5).map(session => (
              <div key={session.id} className="text-xs bg-white/50 p-1 rounded">
                <span className="font-mono">
                  {format(parseISO(session.start_time), 'MM/dd HH:mm')}
                </span>
                <span className="mx-1">-</span>
                <span>{session.timers?.name || 'Unknown'}</span>
                <span className="mx-1">-</span>
                <span>{((session.duration_ms || 0) / 60000).toFixed(0)}m</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionDataDebug;
