
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

// FIXED: Calculate timers for selected date (by creation date) - TIMEZONE SAFE VERSION
export const getTimersForDate = (date: Date | undefined, timers: Timer[]): Timer[] => {
  if (!date) return [];
  
  // Create normalized date strings for comparison (YYYY-MM-DD format)
  const targetDateStr = date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0');
  
  const result = timers.filter(timer => {
    const timerDate = new Date(timer.createdAt);
    const timerDateStr = timerDate.getFullYear() + '-' + 
      String(timerDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(timerDate.getDate()).padStart(2, '0');
    
    const isMatch = timerDateStr === targetDateStr;
    return isMatch;
  });
  
  console.log(`getTimersForDate - ${targetDateStr}:`, {
    targetDateStr,
    totalTimers: timers.length,
    matchingTimers: result.length,
    matches: result.map(t => ({ name: t.name, createdAt: new Date(t.createdAt).toISOString() }))
  });
  
  return result;
};

// FIXED: Calculate timers that have deadlines on a specific date - TIMEZONE SAFE VERSION
export const getTimersWithDeadlinesForDate = (date: Date | undefined, timers: Timer[]): Timer[] => {
  if (!date) return [];
  
  // Create target date string in YYYY-MM-DD format for comparison
  const targetDateStr = date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0');
  
  const result = timers.filter(timer => {
    if (!timer.deadline) return false;
    
    // Convert deadline to local date string for comparison
    const deadlineDate = new Date(timer.deadline);
    const deadlineDateStr = deadlineDate.getFullYear() + '-' + 
      String(deadlineDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(deadlineDate.getDate()).padStart(2, '0');
    
    const isMatch = deadlineDateStr === targetDateStr;
    
    return isMatch;
  });
  
  console.log(`getTimersWithDeadlinesForDate - ${targetDateStr}:`, {
    targetDateStr,
    inputTimers: timers.length,
    timersWithDeadlines: timers.filter(t => t.deadline).length,
    matchingDeadlines: result.length,
    matches: result.map(t => ({ name: t.name, deadline: t.deadline }))
  });
  
  return result;
};

// FIXED: Get all timers relevant to a specific date (created on that date OR have deadline on that date)
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
  
  console.log(`getAllTimersForDate - ${date.toDateString()}:`, {
    createdTimers: createdTimers.length,
    deadlineTimers: deadlineTimers.length,
    totalUniqueTimers: allTimers.length,
    allTimerDetails: allTimers.map(t => ({ 
      name: t.name, 
      id: t.id,
      createdAt: new Date(t.createdAt).toISOString(),
      deadline: t.deadline ? new Date(t.deadline).toISOString() : null,
      category: t.category
    }))
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
