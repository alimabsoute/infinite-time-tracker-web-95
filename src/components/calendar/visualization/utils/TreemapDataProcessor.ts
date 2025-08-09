
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

// Improved treemap layout using simple grid approach
function calculateLayout(
  nodes: Omit<TreemapNodeData, 'x' | 'y' | 'width' | 'height'>[],
  containerWidth: number,
  containerHeight: number
): TreemapNodeData[] {
  if (nodes.length === 0) return [];

  // Sort nodes by value (descending)
  const sortedNodes = [...nodes].sort((a, b) => b.value - a.value);
  const totalValue = sortedNodes.reduce((sum, node) => sum + node.value, 0);

  console.log('🔍 TreemapLayout - Input:', {
    nodeCount: sortedNodes.length,
    containerSize: { width: containerWidth, height: containerHeight },
    totalValue,
    nodeValues: sortedNodes.map(n => ({ name: n.name, value: n.value }))
  });

  const result: TreemapNodeData[] = [];
  
  // Calculate grid dimensions based on number of nodes
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const rows = Math.ceil(nodes.length / cols);
  
  console.log('🔍 TreemapLayout - Grid:', { cols, rows });

  // Calculate base cell dimensions
  const cellWidth = containerWidth / cols;
  const cellHeight = containerHeight / rows;
  
  // Minimum dimensions to ensure visibility
  const minWidth = Math.max(cellWidth * 0.8, 60);
  const minHeight = Math.max(cellHeight * 0.8, 40);

  for (let i = 0; i < sortedNodes.length; i++) {
    const node = sortedNodes[i];
    const ratio = node.value / totalValue;
    
    // Grid position
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    // Base position in grid
    const baseX = col * cellWidth;
    const baseY = row * cellHeight;
    
    // Scale dimensions based on value ratio
    const scaleFactor = Math.max(0.5, Math.min(1.5, ratio * nodes.length));
    let width = Math.max(minWidth, cellWidth * scaleFactor);
    let height = Math.max(minHeight, cellHeight * scaleFactor);
    
    // Ensure we don't exceed cell boundaries
    width = Math.min(width, cellWidth);
    height = Math.min(height, cellHeight);
    
    // Center within the cell
    const x = baseX + (cellWidth - width) / 2;
    const y = baseY + (cellHeight - height) / 2;

    const layoutNode = {
      ...node,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.max(minWidth * 0.8, width),
      height: Math.max(minHeight * 0.8, height)
    };

    console.log('🔍 TreemapLayout - Node:', {
      name: node.name,
      position: { x: layoutNode.x, y: layoutNode.y },
      dimensions: { width: layoutNode.width, height: layoutNode.height },
      gridPos: { col, row }
    });

    result.push(layoutNode);
  }

  console.log('🔍 TreemapLayout - Final result:', {
    nodeCount: result.length,
    allVisible: result.every(n => n.width > 0 && n.height > 0)
  });

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
