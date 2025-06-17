
import { useMemo, useCallback, useRef } from 'react';
import { Timer } from '../types';

interface UseTimerPerformanceProps {
  timers: Timer[];
  filter: string;
  sortBy: string;
}

export const useTimerPerformance = ({ timers, filter, sortBy }: UseTimerPerformanceProps) => {
  const lastFilterRef = useRef(filter);
  const lastSortRef = useRef(sortBy);
  const lastTimersLengthRef = useRef(timers.length);

  // Memoized filtered timers
  const filteredTimers = useMemo(() => {
    if (filter === "all") return timers;
    
    return timers.filter(timer => 
      filter === "Uncategorized" 
        ? !timer.category 
        : timer.category === filter
    );
  }, [timers, filter]);

  // Memoized sorted timers
  const sortedTimers = useMemo(() => {
    const sorted = [...filteredTimers];
    
    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "priority":
        return sorted.sort((a, b) => {
          if (a.priority === undefined && b.priority === undefined) return 0;
          if (a.priority === undefined) return 1;
          if (b.priority === undefined) return -1;
          return a.priority - b.priority;
        });
      case "deadline":
        return sorted.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.getTime() - b.deadline.getTime();
        });
      default:
        return sorted;
    }
  }, [filteredTimers, sortBy]);

  // Memoized categories
  const categories = useMemo(() => {
    return Array.from(new Set(timers.map(timer => timer.category || "Uncategorized")));
  }, [timers]);

  // Performance monitoring
  const hasSignificantChange = useCallback(() => {
    const filterChanged = lastFilterRef.current !== filter;
    const sortChanged = lastSortRef.current !== sortBy;
    const lengthChanged = lastTimersLengthRef.current !== timers.length;
    
    lastFilterRef.current = filter;
    lastSortRef.current = sortBy;
    lastTimersLengthRef.current = timers.length;
    
    return filterChanged || sortChanged || lengthChanged;
  }, [filter, sortBy, timers.length]);

  return {
    filteredTimers,
    sortedTimers,
    categories,
    hasSignificantChange
  };
};
