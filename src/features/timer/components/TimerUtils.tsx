
// Format time helper function
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

// Determine color based on priority
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

// Get timer color class based on timer id or other parameters
export const getTimerColorClass = (id: string): string => {
  // Use the last character of the ID to determine a color class
  const lastChar = id.charAt(id.length - 1);
  const colorIndex = parseInt(lastChar, 16) % 10 + 1; // Convert to number (base 16) and ensure it's 1-10
  return `timer-color-${colorIndex}`;
};
