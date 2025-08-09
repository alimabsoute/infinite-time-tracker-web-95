
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
  const rowHeight = sum / width;
  
  let currentX = x;
  const result: TreemapNodeData[] = [];
  
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
  
  const width = Math.min(rect.width, rect.height);
  const currentWorst = row.length > 0 ? calculateWorstAspectRatio(row, width) : Infinity;
  const newWorst = calculateWorstAspectRatio(newRow, width);
  
  if (row.length === 0 || newWorst <= currentWorst) {
    // Adding the node improves or maintains aspect ratios
    return squarify(remainingNodes, newRow, rect);
  } else {
    // Layout current row and continue with remaining area
    const rowSum = row.reduce((acc, node) => acc + node.area, 0);
    const rowHeight = rowSum / rect.width;
    
    const layoutResult = layoutRow(row, rect.x, rect.y, rect.width, rect.height);
    
    const newRect: Rectangle = {
      x: rect.x,
      y: rect.y + rowHeight,
      width: rect.width,
      height: rect.height - rowHeight
    };
    
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

  console.log('🔍 TreemapLayout - Input:', {
    nodeCount: sortedNodes.length,
    containerSize: { width: containerWidth, height: containerHeight },
    totalValue,
    containerArea
  });

  // Convert to layout nodes with calculated areas
  const layoutNodes: LayoutNode[] = sortedNodes.map(node => ({
    ...node,
    area: (node.value / totalValue) * containerArea
  }));

  console.log('🔍 TreemapLayout - Areas:', layoutNodes.map(n => ({
    name: n.name,
    value: n.value,
    area: n.area.toFixed(1),
    percentage: ((n.value / totalValue) * 100).toFixed(1) + '%'
  })));

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

  console.log('🔍 TreemapLayout - Final result:', {
    nodeCount: result.length,
    totalCalculatedArea: totalCalculatedArea.toFixed(1),
    containerArea: containerArea.toFixed(1),
    coverage: coverage.toFixed(1) + '%',
    allPositive: result.every(n => n.width > 0 && n.height > 0),
    rectangles: result.map(r => ({
      name: r.name,
      area: (r.width * r.height).toFixed(1),
      dimensions: `${r.width.toFixed(1)}x${r.height.toFixed(1)}`
    }))
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
