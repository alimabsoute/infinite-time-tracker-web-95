
import { TimerSessionWithTimer } from '../../../types';

export interface BubbleDataPoint {
  x: number;
  y: number;
  size: number;
  timerId: string;
  name: string;
  category: string;
  totalHours: string;
  avgMinutes: string;
  sessionCount: number;
  color: string;
  sessions: TimerSessionWithTimer[];
  isRunning: boolean;
}

// Light pastel colors with transparency
const PASTEL_COLORS = [
  'rgba(255, 182, 193, 0.7)', // Light Pink
  'rgba(173, 216, 230, 0.7)', // Light Blue
  'rgba(144, 238, 144, 0.7)', // Light Green
  'rgba(255, 218, 185, 0.7)', // Peach
  'rgba(221, 160, 221, 0.7)', // Plum
  'rgba(255, 255, 224, 0.7)', // Light Yellow
  'rgba(175, 238, 238, 0.7)', // Pale Turquoise
  'rgba(255, 192, 203, 0.7)', // Pink
  'rgba(230, 230, 250, 0.7)', // Lavender
  'rgba(255, 228, 225, 0.7)', // Misty Rose
  'rgba(240, 248, 255, 0.7)', // Alice Blue
  'rgba(250, 240, 230, 0.7)', // Linen
];

export const processBubbleData = (
  sessions: TimerSessionWithTimer[], 
  selectedCategory?: string
): BubbleDataPoint[] => {
  console.log('🔍 BubbleDataProcessor - Processing sessions:', {
    totalSessions: sessions.length,
    selectedCategory
  });
  
  // Filter sessions with proper validation
  const filteredSessions = sessions.filter(session => {
    const hasDuration = session.duration_ms && session.duration_ms > 0;
    const hasTimer = session.timers && session.timer_id && session.timers.name;
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || session.timers?.category === selectedCategory;
    
    return hasDuration && hasTimer && matchesCategory;
  });

  if (filteredSessions.length === 0) {
    return [];
  }

  // Group sessions by timer
  const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
  filteredSessions.forEach(session => {
    const timerId = session.timer_id;
    if (!timerGroups[timerId]) {
      timerGroups[timerId] = [];
    }
    timerGroups[timerId].push(session);
  });

  const bubbleData = Object.entries(timerGroups).map(([timerId, timerSessions], index) => {
    const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
    const sessionCount = timerSessions.length;
    const avgSessionTime = totalTime / sessionCount;
    const timer = timerSessions[0].timers;
    
    // Check if any session is a running timer (virtual session)
    const isRunning = timerSessions.some(s => s.id.startsWith('virtual-'));
    
    // Calculate bubble size - DRAMATICALLY increased scaling
    const hoursLogged = totalTime / (1000 * 60 * 60);
    // Minimum size 500, maximum size 8000, much more aggressive scaling
    const bubbleSize = Math.max(500, Math.min(8000, hoursLogged * 1200 + sessionCount * 200));
    
    // Use light pastel colors with transparency
    let color = PASTEL_COLORS[index % PASTEL_COLORS.length];
    
    // Special color for running timers - bright green with transparency
    if (isRunning) {
      color = 'rgba(34, 197, 94, 0.8)'; // Bright green with transparency
    }
    
    const dataPoint: BubbleDataPoint = {
      x: totalTime / (1000 * 60 * 60), // Total hours
      y: avgSessionTime / (1000 * 60), // Avg session minutes
      size: bubbleSize, // MUCH larger size range (500-8000)
      timerId,
      name: timer?.name || 'Unknown Timer',
      category: timer?.category || 'Uncategorized',
      totalHours: (totalTime / (1000 * 60 * 60)).toFixed(1),
      avgMinutes: (avgSessionTime / (1000 * 60)).toFixed(1),
      sessionCount,
      color,
      sessions: timerSessions,
      isRunning
    };
    
    console.log('🔍 BubbleDataProcessor - Created bubble with LARGE size:', {
      name: dataPoint.name,
      totalHours: dataPoint.totalHours,
      sessionCount: dataPoint.sessionCount,
      bubbleSize: dataPoint.size,
      isRunning: dataPoint.isRunning,
      color: dataPoint.color
    });
    
    return dataPoint;
  });

  return bubbleData;
};
