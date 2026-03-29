
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

// Proper squarified treemap algorithm
interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutNode extends Omit<TreemapNodeData, 'x' | 'y' | 'width' | 'height'> {
  area: number;
}

function calculateAspectRatio(width: number, height: number): number {
  return Math.max(width / height, height / width);
}

function calculateWorstAspectRatio(row: LayoutNode[], width: number): number {
  const sum = row.reduce((acc, node) => acc + node.area, 0);
  const rowHeight = sum / width;
  
  let worst = 0;
  for (const node of row) {
    const nodeWidth = node.area / rowHeight;
    const aspectRatio = calculateAspectRatio(nodeWidth, rowHeight);
    worst = Math.max(worst, aspectRatio);
  }
  
  return worst;
}

function layoutRow(
  row: LayoutNode[], 
  x: number, 
  y: number, 
  width: number, 
  height: number
): TreemapNodeData[] {
  const sum = row.reduce((acc, node) => acc + node.area, 0);
  
  // Determine if we're laying out horizontally or vertically based on container shape
  const useHorizontalLayout = width >= height;
  
  const result: TreemapNodeData[] = [];
  
  if (useHorizontalLayout) {
    // Layout nodes horizontally (varying widths, same height)
    const rowHeight = height;
    let currentX = x;
    
    for (const node of row) {
      const nodeWidth = node.area / rowHeight;
      
      result.push({
        ...node,
        x: currentX,
        y,
        width: nodeWidth,
        height: rowHeight
      });
      
      currentX += nodeWidth;
    }
  } else {
    // Layout nodes vertically (same width, varying heights)
    const rowWidth = width;
    let currentY = y;
    
    for (const node of row) {
      const nodeHeight = node.area / rowWidth;
      
      result.push({
        ...node,
        x,
        y: currentY,
        width: rowWidth,
        height: nodeHeight
      });
      
      currentY += nodeHeight;
    }
  }
  
  return result;
}

function squarify(
  nodes: LayoutNode[],
  row: LayoutNode[],
  rect: Rectangle
): TreemapNodeData[] {
  if (nodes.length === 0) {
    if (row.length === 0) return [];
    return layoutRow(row, rect.x, rect.y, rect.width, rect.height);
  }

  const currentNode = nodes[0];
  const remainingNodes = nodes.slice(1);
  const newRow = [...row, currentNode];
  
  // Use the shorter side for width calculation (proper squarified algorithm)
  const w = Math.min(rect.width, rect.height);
  
  if (row.length === 0) {
    // First node in row, must add it
    return squarify(remainingNodes, newRow, rect);
  }
  
  const currentWorst = calculateWorstAspectRatio(row, w);
  const newWorst = calculateWorstAspectRatio(newRow, w);
  
  if (newWorst <= currentWorst) {
    // Adding the node improves aspect ratios, continue
    return squarify(remainingNodes, newRow, rect);
  } else {
    // Layout current row and continue with remaining area
    const rowSum = row.reduce((acc, node) => acc + node.area, 0);
    
    // Determine orientation based on container shape
    const useVerticalRows = rect.width >= rect.height;
    
    let layoutResult: TreemapNodeData[];
    let newRect: Rectangle;
    
    if (useVerticalRows) {
      // Layout row vertically (nodes stacked horizontally)
      const rowWidth = rowSum / rect.height;
      layoutResult = layoutRow(row, rect.x, rect.y, rowWidth, rect.height);
      newRect = {
        x: rect.x + rowWidth,
        y: rect.y,
        width: rect.width - rowWidth,
        height: rect.height
      };
    } else {
      // Layout row horizontally (nodes stacked vertically)
      const rowHeight = rowSum / rect.width;
      layoutResult = layoutRow(row, rect.x, rect.y, rect.width, rowHeight);
      newRect = {
        x: rect.x,
        y: rect.y + rowHeight,
        width: rect.width,
        height: rect.height - rowHeight
      };
    }
    
    return [
      ...layoutResult,
      ...squarify(nodes, [], newRect)
    ];
  }
}

function calculateLayout(
  nodes: Omit<TreemapNodeData, 'x' | 'y' | 'width' | 'height'>[],
  containerWidth: number,
  containerHeight: number
): TreemapNodeData[] {
  if (nodes.length === 0) return [];

  // Sort nodes by value (descending) for better layout
  const sortedNodes = [...nodes].sort((a, b) => b.value - a.value);
  const totalValue = sortedNodes.reduce((sum, node) => sum + node.value, 0);
  const containerArea = containerWidth * containerHeight;


  // Convert to layout nodes with calculated areas
  const layoutNodes: LayoutNode[] = sortedNodes.map(node => ({
    ...node,
    area: (node.value / totalValue) * containerArea
  }));


  // Apply squarified treemap algorithm
  const result = squarify(layoutNodes, [], {
    x: 0,
    y: 0,
    width: containerWidth,
    height: containerHeight
  });

  // Validation: Check total area coverage
  const totalCalculatedArea = result.reduce((sum, rect) => sum + (rect.width * rect.height), 0);
  const coverage = (totalCalculatedArea / containerArea) * 100;


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
  viewMode: 'category' | 'timer' = 'category',
  containerWidth: number = 800,
  containerHeight: number = 500
): TreemapData | null {
  // Filter valid sessions with enhanced validation, including running timers
  const validSessions = sessions.filter(session => {
    const isRunningTimer = session.id.startsWith('virtual-');
    const hasDuration = session.duration_ms && (session.duration_ms > 0 || (isRunningTimer && session.duration_ms >= 0));
    const hasTimer = session.timers && session.timer_id && session.timers.name;
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || session.timers?.category === selectedCategory;
    
    return hasDuration && hasTimer && matchesCategory;
  });


  if (validSessions.length === 0) {
    return null;
  }

  // Enhanced data grouping with better aggregation
  let groupedData: { [key: string]: { 
    name: string; 
    value: number; 
    sessions: number; 
    category?: string; 
    lastUsed?: string;
  } } = {};

  if (viewMode === 'category') {
    // Group by category with better handling
    validSessions.forEach(session => {
      const category = session.timers?.category || 'Uncategorized';
      const categoryKey = category.toLowerCase().replace(/\s+/g, '_');
      
      if (!groupedData[categoryKey]) {
        groupedData[categoryKey] = {
          name: category,
          value: 0,
          sessions: 0,
          lastUsed: session.start_time
        };
      }
      
      groupedData[categoryKey].value += session.duration_ms || 0;
      groupedData[categoryKey].sessions += 1;
      
      // Track most recent usage
      if (session.start_time > (groupedData[categoryKey].lastUsed || '')) {
        groupedData[categoryKey].lastUsed = session.start_time;
      }
    });
  } else {
    // Group by individual timer
    validSessions.forEach(session => {
      const timerId = session.timer_id;
      const timerName = session.timers?.name || 'Unknown Timer';
      
      if (!groupedData[timerId]) {
        groupedData[timerId] = {
          name: timerName,
          value: 0,
          sessions: 0,
          category: session.timers?.category || 'Uncategorized',
          lastUsed: session.start_time
        };
      }
      
      groupedData[timerId].value += session.duration_ms || 0;
      groupedData[timerId].sessions += 1;
      
      // Track most recent usage
      if (session.start_time > (groupedData[timerId].lastUsed || '')) {
        groupedData[timerId].lastUsed = session.start_time;
      }
    });
  }

  const entries = Object.entries(groupedData);
  const totalValue = entries.reduce((sum, [, data]) => sum + data.value, 0);
  const maxValue = Math.max(...entries.map(([, data]) => data.value));


  // Create nodes with proper scaling
  const nodes = entries.map(([id, data], index) => ({
    id,
    name: data.name,
    value: data.value,
    sessions: data.sessions,
    category: data.category,
    color: generateColor(index, data.value / maxValue)
  }));

  // Filter out nodes that are too small to be meaningful
  const minValue = totalValue * 0.001; // 0.1% threshold
  const filteredNodes = nodes.filter(node => node.value >= minValue);


  // Calculate layout with proper container dimensions
  const layoutNodes = calculateLayout(filteredNodes, containerWidth, containerHeight);


  return {
    name: viewMode === 'category' ? 'Categories' : 'Timers',
    children: layoutNodes,
    totalValue
  };
}
