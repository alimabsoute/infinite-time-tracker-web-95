
// Timer color palette - enhanced with more vibrant colors
const TIMER_COLORS = [
  'hsl(221, 83%, 53%)',  // Blue
  'hsl(262, 80%, 55%)',  // Purple  
  'hsl(291, 64%, 50%)',  // Magenta
  'hsl(326, 72%, 48%)',  // Rose
  'hsl(354, 70%, 54%)',  // Red
  'hsl(24, 90%, 50%)',   // Orange
  'hsl(43, 96%, 45%)',   // Amber
  'hsl(142, 71%, 40%)',  // Green
  'hsl(172, 66%, 48%)',  // Teal
  'hsl(199, 89%, 48%)',  // Cyan
];

export const getTimerColor = (timerId: string): string => {
  if (!timerId) return TIMER_COLORS[0];

  let hash = 0;
  for (let i = 0; i < timerId.length; i++) {
    const char = timerId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const colorIndex = Math.abs(hash) % TIMER_COLORS.length;
  return TIMER_COLORS[colorIndex];
};

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

export const getPriorityColor = (priority?: number): string => {
  switch (priority) {
    case 3:
      return 'rgba(239, 68, 68, 0.85)'; // High - red
    case 2:
      return 'rgba(245, 158, 11, 0.85)'; // Medium - amber
    case 1:
      return 'rgba(34, 197, 94, 0.85)'; // Low - green
    default:
      return 'rgba(148, 163, 184, 0.85)'; // None - slate
  }
};

export const getTimerColorClass = (id: string): string => {
  const lastChar = id.charAt(id.length - 1);
  const colorIndex = parseInt(lastChar, 16) % 10 + 1;
  return `timer-color-${colorIndex}`;
};
