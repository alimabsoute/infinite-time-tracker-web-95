
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer } from "../../types";
import { Clock, PlayCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface HorizontalTimerDisplayProps {
  timers: Timer[];
  formatTime: (ms: number) => string;
}

const HorizontalTimerDisplay: React.FC<HorizontalTimerDisplayProps> = ({
  timers,
  formatTime
}) => {
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

  if (timers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <PlayCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No timers for this date</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Timers</h3>
        <Badge variant="secondary" className="ml-auto">
          {timers.length} session{timers.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {timers.map((timer, index) => (
          <motion.div
            key={timer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-md transition-all duration-200 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Category indicator */}
                  <div 
                    className={cn(
                      "w-1 h-12 rounded-full flex-shrink-0",
                      getCategoryColor(timer.category)
                    )}
                  />
                  
                  {/* Timer content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {timer.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono">{formatTime(timer.elapsedTime)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {timer.category && (
                          <Badge variant="outline" className="text-xs">
                            {timer.category}
                          </Badge>
                        )}
                        
                        {timer.deadline && (
                          <Badge variant="secondary" className="text-xs">
                            Due: {format(new Date(timer.deadline), 'MMM d, HH:mm')}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(timer.createdAt), 'HH:mm')}
                      </div>
                    </div>
                    
                    {timer.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {timer.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalTimerDisplay;
