
import { Timer } from "../../types";

// Format time for display
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Calculate timers for selected date (by creation date)
export const getTimersForDate = (date: Date | undefined, timers: Timer[]): Timer[] => {
  if (!date) return [];
  
  // Set time to midnight for comparison
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return timers.filter(timer => {
    const timerDate = new Date(timer.createdAt);
    return timerDate >= startOfDay && timerDate <= endOfDay;
  });
};

// Calculate timers that have deadlines on a specific date
export const getTimersWithDeadlinesForDate = (date: Date | undefined, timers: Timer[]): Timer[] => {
  if (!date) return [];
  
  // Set time to midnight for comparison
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return timers.filter(timer => {
    if (!timer.deadline) return false;
    const deadlineDate = new Date(timer.deadline);
    return deadlineDate >= startOfDay && deadlineDate <= endOfDay;
  });
};

// Get all timers relevant to a specific date (created on that date OR have deadline on that date)
export const getAllTimersForDate = (date: Date | undefined, timers: Timer[]): Timer[] => {
  if (!date) return [];
  
  const createdTimers = getTimersForDate(date, timers);
  const deadlineTimers = getTimersWithDeadlinesForDate(date, timers);
  
  // Combine and deduplicate timers
  const allTimers = [...createdTimers];
  deadlineTimers.forEach(deadlineTimer => {
    if (!allTimers.find(timer => timer.id === deadlineTimer.id)) {
      allTimers.push(deadlineTimer);
    }
  });
  
  return allTimers;
};

// Calculate total time tracked for a specific date (only from timers created on that date)
export const getTotalTimeForDate = (date: Date, timers: Timer[]): number => {
  const dayTimers = getTimersForDate(date, timers);
  return dayTimers.reduce((total, timer) => total + timer.elapsedTime, 0);
};

// Generate color intensity based on activity level
export const getHeatMapColor = (date: Date, timers: Timer[]): string => {
  const totalTime = getTotalTimeForDate(date, timers);
  
  if (totalTime === 0) return "bg-transparent";
  if (totalTime < 1800000) return "bg-blue-500/20"; // Less than 30 mins
  if (totalTime < 3600000) return "bg-blue-500/40"; // Less than 1 hour
  if (totalTime < 7200000) return "bg-blue-500/60"; // Less than 2 hours
  if (totalTime < 14400000) return "bg-blue-500/80"; // Less than 4 hours
  return "bg-blue-500"; // More than 4 hours
};
