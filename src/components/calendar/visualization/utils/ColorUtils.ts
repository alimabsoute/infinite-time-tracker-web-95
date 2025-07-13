
export const getCategoryColor = (category: string, isRunning: boolean): string => {
  const colors: Record<string, string> = {
    'Work': '#3b82f6',
    'Personal': '#10b981',
    'Study': '#f59e0b',
    'Exercise': '#ef4444',
    'Health': '#8b5cf6',
    'Learning': '#06b6d4',
    'Uncategorized': '#6b7280'
  };
  
  let color = colors[category] || colors.Uncategorized;
  
  // Override color for running timers
  if (isRunning) {
    color = '#22c55e'; // Green for running timers
  }
  
  return color;
};
