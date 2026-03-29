
import React from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
  className?: string;
  onComplete?: () => void;
  variant?: 'default' | 'urgent' | 'warning' | 'work' | 'short-break' | 'long-break';
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  label,
  className,
  onComplete,
  variant = 'default'
}) => {
  const { timeRemaining, formatTime, isExpired } = useCountdown({
    targetDate,
    onComplete
  });

  const getVariantStyles = () => {
    if (isExpired) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    
    switch (variant) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'work':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'short-break':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'long-break':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getUrgencyVariant = () => {
    if (isExpired) return 'urgent';
    if (timeRemaining.totalMs < 24 * 60 * 60 * 1000) return 'urgent'; // Less than 1 day
    if (timeRemaining.totalMs < 3 * 24 * 60 * 60 * 1000) return 'warning'; // Less than 3 days
    return 'default';
  };

  const actualVariant = variant === 'default' ? getUrgencyVariant() : variant;

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium',
      getVariantStyles(),
      className
    )}>
      {label && <span className="text-xs opacity-75">{label}</span>}
      <span className="font-mono">
        {formatTime()}
      </span>
      {isExpired && (
        <span className="animate-pulse"></span>
      )}
    </div>
  );
};

export default CountdownTimer;
