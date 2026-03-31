
import { useState, useEffect, useCallback } from 'react';

interface UseCountdownOptions {
  targetDate: Date;
  onComplete?: () => void;
  interval?: number;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
}

export const useCountdown = ({ targetDate, onComplete, interval = 1000 }: UseCountdownOptions) => {
  const calculateTimeRemaining = useCallback((): TimeRemaining => {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const difference = target - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMs: 0,
        isExpired: true
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      totalMs: difference,
      isExpired: false
    };
  }, [targetDate]);

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(calculateTimeRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining();
      setTimeRemaining(newTimeRemaining);

      if (newTimeRemaining.isExpired && onComplete) {
        onComplete();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [calculateTimeRemaining, onComplete, interval]);

  const formatTime = (time: TimeRemaining): string => {
    if (time.isExpired) return 'Expired';
    
    if (time.days > 0) {
      return `${time.days}d ${time.hours}h`;
    } else if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m`;
    } else if (time.minutes > 0) {
      return `${time.minutes}m ${time.seconds}s`;
    } else {
      return `${time.seconds}s`;
    }
  };

  return {
    timeRemaining,
    formatTime: () => formatTime(timeRemaining),
    isExpired: timeRemaining.isExpired
  };
};
