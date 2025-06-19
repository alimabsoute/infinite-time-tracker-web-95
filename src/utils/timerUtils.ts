
import { Timer } from '../types';

// Timer color utilities - consolidated from TimerUtils.tsx
const TIMER_COLORS = [
  'hsl(221, 83%, 53%)', // Blue
  'hsl(142, 76%, 36%)', // Green
  'hsl(262, 83%, 58%)', // Purple
  'hsl(346, 87%, 43%)', // Red
  'hsl(32, 98%, 56%)',  // Orange
  'hsl(271, 76%, 53%)', // Violet
  'hsl(184, 100%, 39%)', // Cyan
  'hsl(45, 93%, 47%)',  // Yellow
];

export const getTimerColor = (id: string): string => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TIMER_COLORS[hash % TIMER_COLORS.length];
};

export const getTimerColorClass = (id: string): string => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % TIMER_COLORS.length;
  return `timer-color-${colorIndex}`;
};

// Time formatting utilities
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Timer validation utilities
export const validateTimerName = (name: string): boolean => {
  return name.trim().length > 0 && name.length <= 100;
};

export const validateCategory = (category?: string): boolean => {
  if (!category) return true;
  return category.length <= 50;
};

// Timer state utilities
export const isTimerOverdue = (timer: Timer): boolean => {
  return !!(timer.deadline && new Date(timer.deadline) < new Date());
};

export const getTimerProgress = (timer: Timer): number => {
  // Calculate progress based on elapsed time (max at 1 hour = 100%)
  return Math.min(100, (timer.elapsedTime / 3600000) * 100);
};

// Timer sorting utilities
export const sortTimersByPriority = (timers: Timer[]): Timer[] => {
  return [...timers].sort((a, b) => {
    if (a.priority === undefined && b.priority === undefined) return 0;
    if (a.priority === undefined) return 1;
    if (b.priority === undefined) return -1;
    return a.priority - b.priority;
  });
};

export const sortTimersByDeadline = (timers: Timer[]): Timer[] => {
  return [...timers].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return a.deadline.getTime() - b.deadline.getTime();
  });
};

export const sortTimersByName = (timers: Timer[]): Timer[] => {
  return [...timers].sort((a, b) => a.name.localeCompare(b.name));
};
