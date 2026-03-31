
import React, { useState, useEffect } from 'react';
import { Timer } from '../../types';
import { formatTime } from '../timer/TimerUtils';
import { getProcessedTimerColors } from '../../utils/timerColorProcessor';
import { Play, Pause, RotateCcw, Calendar, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface ActiveTimerCardProps {
  timer: Timer;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
}

const ActiveTimerCard: React.FC<ActiveTimerCardProps> = ({
  timer,
  onToggle,
  onReset
}) => {
  const [currentTime, setCurrentTime] = useState(timer.elapsedTime);
  const colors = getProcessedTimerColors(timer.id);

  // Update current time for running timers
  useEffect(() => {
    if (!timer.isRunning) {
      setCurrentTime(timer.elapsedTime);
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.elapsedTime]);

  const getPriorityColor = (priority?: number) => {
    switch (priority) {
      case 1: return 'text-red-600 bg-red-50';
      case 2: return 'text-orange-600 bg-orange-50';
      case 3: return 'text-yellow-600 bg-yellow-50';
      case 4: return 'text-blue-600 bg-blue-50';
      case 5: return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority?: number) => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Med-High';
      case 3: return 'Med';
      case 4: return 'Med-Low';
      case 5: return 'Low';
      default: return 'Med';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStartDate = () => {
    if (timer.sessionStartTime) {
      return timer.sessionStartTime;
    }
    return timer.createdAt;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        {/* Left section with circular progress and timer info */}
        <div className="flex items-center space-x-4">
          {/* Circular Progress Indicator */}
          <div className="relative flex-shrink-0">
            <div 
              className="w-16 h-16 rounded-full border-4 flex items-center justify-center relative"
              style={{ borderColor: colors.primaryBorder }}
            >
              {/* Running indicator pulse */}
              {timer.isRunning && (
                <div 
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{ 
                    backgroundColor: colors.primaryBorder,
                    opacity: 0.1 
                  }}
                />
              )}
              
              {/* Time display in center */}
              <div className="text-xs font-mono text-gray-700">
                {formatTime(currentTime).split(':').slice(1).join(':')}
              </div>
            </div>
          </div>

          {/* Timer Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.primaryBorder }}
              />
              <h3 className="font-semibold text-gray-900">{timer.name}</h3>
              {timer.category && (
                <Badge variant="secondary" className="text-xs">
                  {timer.category}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="font-mono font-medium text-lg text-gray-900">
                {formatTime(currentTime)}
              </div>
              <span className={`px-2 py-1 rounded text-xs ${timer.isRunning ? 'text-green-700 bg-green-50' : 'text-gray-600 bg-gray-50'}`}>
                {timer.isRunning ? 'Running' : 'Paused'}
              </span>
            </div>

            {/* Additional Metrics */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Started: {formatDate(getStartDate())}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Total: {formatTime(timer.elapsedTime)}</span>
              </div>
              {timer.deadline && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Due: {formatDate(timer.deadline)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right section with priority and controls */}
        <div className="flex items-center space-x-3">
          {/* Priority Badge */}
          <Badge 
            variant="outline" 
            className={`text-xs ${getPriorityColor(timer.priority)}`}
          >
            {getPriorityLabel(timer.priority)}
          </Badge>

          {/* Control Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggle(timer.id)}
              className="w-8 h-8 p-0"
            >
              {timer.isRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReset(timer.id)}
              className="w-8 h-8 p-0"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveTimerCard;
