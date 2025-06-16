
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, TimerSessionWithTimer } from "../../types";
import { Clock, PlayCircle, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from "@/lib/utils";
import PhynxTimerLogo from '../PhynxTimerLogo';

interface HorizontalTimerDisplayProps {
  sessions: TimerSessionWithTimer[];
  formatTime: (ms: number) => string;
}

const HorizontalTimerDisplay: React.FC<HorizontalTimerDisplayProps> = ({
  sessions,
  formatTime
}) => {
  console.log('=== HorizontalTimerDisplay Debug ===');
  console.log('HorizontalTimerDisplay - Received sessions count:', sessions?.length || 0);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "Work": return "bg-blue-500";
      case "Study": return "bg-purple-500";
      case "Personal": return "bg-green-500";
      case "Health": return "bg-red-500";
      case "Leisure": return "bg-amber-500";
      case "Project": return "bg-indigo-500";
      case "Meeting": return "bg-pink-500";
      default: return "bg-gray-500";
    }
  };

  if (!sessions || sessions.length === 0) {
    console.log('HorizontalTimerDisplay - No sessions to display');
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <PlayCircle className="h-12 w-12 opacity-50" />
            <PhynxTimerLogo width={24} height={24} className="absolute top-3 left-3 opacity-30" />
          </div>
          <div>
            <p className="text-sm font-medium">No timer sessions for this date</p>
            <p className="text-xs mt-1">Start a timer to see your activity here</p>
          </div>
        </div>
      </div>
    );
  };

  // Sort sessions by start time (most recent first)
  const sortedSessions = React.useMemo(() => {
    return [...sessions].sort((a, b) => {
      const dateA = parseISO(a.start_time).getTime();
      const dateB = parseISO(b.start_time).getTime();
      return dateB - dateA;
    });
  }, [sessions]);

  // Calculate total time for the day
  const totalTime = React.useMemo(() => {
    return sortedSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
  }, [sortedSessions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Timer Sessions</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {sortedSessions.length} session{sortedSessions.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline" className="text-xs font-mono">
            Total: {formatTime(totalTime)}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {sortedSessions.map((session, index) => (
          <motion.div
            key={`${session.id}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="group hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Enhanced category indicator */}
                  <div 
                    className={cn(
                      "w-1.5 h-14 rounded-full flex-shrink-0 shadow-sm",
                      getCategoryColor(session.timers?.category || undefined)
                    )}
                  />
                  
                  {/* Session content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {session.timers?.name || 'Untitled Timer'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono font-medium">{formatTime(session.duration_ms || 0)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {session.timers?.category && (
                          <Badge variant="outline" className="text-xs">
                            {session.timers.category}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground flex-shrink-0">
                        {format(parseISO(session.start_time), 'HH:mm')}
                        {session.end_time && ` - ${format(parseISO(session.end_time), 'HH:mm')}`}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Summary footer */}
      {sortedSessions.length > 3 && (
        <div className="text-center pt-2 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Showing {sortedSessions.length} timer sessions • Total time: {formatTime(totalTime)}
          </p>
        </div>
      )}
    </div>
  );
};

export default HorizontalTimerDisplay;
