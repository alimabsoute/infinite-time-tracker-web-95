
import { TimerSessionWithTimer } from '../../../../types';

export interface TreemapNodeData {
  id: string;
  name: string;
  value: number; // total time in ms
  sessions: number;
  category?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface TreemapData {
  name: string;
  children: TreemapNodeData[];
  totalValue: number;
}

// Simple treemap layout algorithm (squarified treemap approximation)
function calculateLayout(
  nodes: Omit<TreemapNodeData, 'x' | 'y' | 'width' | 'height'>[],
  containerWidth: number,
  containerHeight: number
): TreemapNodeData[] {
  if (nodes.length === 0) return [];

  // Sort nodes by value (descending)
  const sortedNodes = [...nodes].sort((a, b) => b.value - a.value);
  const totalValue = sortedNodes.reduce((sum, node) => sum + node.value, 0);

  const result: TreemapNodeData[] = [];
  let currentX = 0;
  let currentY = 0;
  let rowHeight = 0;
  let remainingWidth = containerWidth;
  let remainingHeight = containerHeight;

  for (let i = 0; i < sortedNodes.length; i++) {
    const node = sortedNodes[i];
    const ratio = node.value / totalValue;
    const area = ratio * containerWidth * containerHeight;
    
    // Estimate dimensions for this rectangle
    let width: number, height: number;
    
    if (remainingWidth > remainingHeight) {
      // Wider than tall - create vertical strip
      width = Math.min(remainingWidth, Math.sqrt(area * (remainingWidth / remainingHeight)));
      height = area / width;
    } else {
      // Taller than wide - create horizontal strip
      height = Math.min(remainingHeight, Math.sqrt(area * (remainingHeight / remainingWidth)));
      width = area / height;
    }

    // Ensure minimum dimensions
    width = Math.max(width, 30);
    height = Math.max(height, 20);

    // Check if we need to start a new row
    if (currentX + width > containerWidth && currentX > 0) {
      currentX = 0;
      currentY += rowHeight;
      rowHeight = 0;
      remainingHeight -= rowHeight;
    }

    // Adjust if exceeding container bounds
    if (currentX + width > containerWidth) {
      width = containerWidth - currentX;
    }
    if (currentY + height > containerHeight) {
      height = containerHeight - currentY;
    }

    result.push({
      ...node,
      x: currentX,
      y: currentY,
      width: Math.max(width, 20),
      height: Math.max(height, 15)
    });

    currentX += width;
    rowHeight = Math.max(rowHeight, height);

    // If we've filled the row, move to next row
    if (currentX >= containerWidth - 10) {
      currentX = 0;
      currentY += rowHeight;
      rowHeight = 0;
    }
  }

  return result;
}

function generateColor(index: number, intensity: number): string {
  const hues = [
    220, // Blue
    280, // Purple  
    340, // Pink
    200, // Cyan
    160, // Green
    40,  // Yellow
    20,  // Orange
    0,   // Red
  ];
  
  const hue = hues[index % hues.length];
  const saturation = Math.min(80, 50 + intensity * 30);
  const lightness = Math.max(40, 70 - intensity * 20);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function processTreemapData(
  sessions: TimerSessionWithTimer[],
  selectedCategory?: string,
  viewMode: 'category' | 'timer' = 'category'
): TreemapData | null {
  console.log('🔍 TreemapDataProcessor - Processing:', {
    sessionsCount: sessions.length,
    selectedCategory,
    viewMode
  });

  // Filter valid sessions
  const validSessions = sessions.filter(session => {
    const hasDuration = session.duration_ms && session.duration_ms > 0;
    const hasTimer = session.timers && session.timer_id && session.timers.name;
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || session.timers?.category === selectedCategory;
    
    return hasDuration && hasTimer && matchesCategory;
  });

  if (validSessions.length === 0) {
    return null;
  }

  let groupedData: { [key: string]: { 
    name: string; 
    value: number; 
    sessions: number; 
    category?: string; 
  } } = {};

  if (viewMode === 'category') {
    // Group by category
    validSessions.forEach(session => {
      const category = session.timers?.category || 'Uncategorized';
      if (!groupedData[category]) {
        groupedData[category] = {
          name: category,
          value: 0,
          sessions: 0
        };
      }
      groupedData[category].value += session.duration_ms || 0;
      groupedData[category].sessions += 1;
    });
  } else {
    // Group by timer
    validSessions.forEach(session => {
      const timerId = session.timer_id;
      const timerName = session.timers?.name || 'Unknown Timer';
      if (!groupedData[timerId]) {
        groupedData[timerId] = {
          name: timerName,
          value: 0,
          sessions: 0,
          category: session.timers?.category
        };
      }
      groupedData[timerId].value += session.duration_ms || 0;
      groupedData[timerId].sessions += 1;
    });
  }

  const entries = Object.entries(groupedData);
  const totalValue = entries.reduce((sum, [, data]) => sum + data.value, 0);
  const maxValue = Math.max(...entries.map(([, data]) => data.value));

  // Create nodes with layout information
  const nodes = entries.map(([id, data], index) => ({
    id,
    name: data.name,
    value: data.value,
    sessions: data.sessions,
    category: data.category,
    color: generateColor(index, data.value / maxValue)
  }));

  // Calculate layout (using fixed container size for SVG)
  const containerWidth = 800;
  const containerHeight = 500;
  const layoutNodes = calculateLayout(nodes, containerWidth, containerHeight);

  console.log('🔍 TreemapDataProcessor - Created:', {
    nodes: layoutNodes.length,
    totalValue: (totalValue / (1000 * 60 * 60)).toFixed(1) + 'h'
  });

  return {
    name: viewMode === 'category' ? 'Categories' : 'Timers',
    children: layoutNodes,
    totalValue
  };
}
