
import { Timer } from '@/types';

export const getTimerDashboardStats = (timers: Timer[]) => {
  const runningTimersCount = timers.filter(timer => timer.isRunning).length;
  const totalTimeToday = timers.reduce((total, timer) => total + timer.elapsedTime, 0);
  
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    title: "Timer Dashboard",
    description: `${runningTimersCount} timer${runningTimersCount !== 1 ? 's' : ''} running • Total time today: ${formatTime(totalTimeToday)}`
  };
};
