
import { getTimerColor } from './timerUtils';

export interface ProcessedTimerColors {
  primaryBorder: string;
  secondaryBorder: string;
  backgroundFill: string;
  shadowColor: string;
}

export const processTimerColor = (rawColor: string, timerId: string): ProcessedTimerColors => {
  
  // Validate and process the color
  let processedColor = rawColor;
  
  // Extract HSL values with improved parsing
  const hslMatch = processedColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  
  if (hslMatch) {
    const [, h, s, l] = hslMatch;
    const hue = parseInt(h);
    const saturation = parseInt(s);
    const lightness = parseInt(l);
    
    
    // Create strong, visible colors optimized for circular borders
    const primaryBorder = `hsl(${hue}, ${Math.max(85, saturation)}%, ${Math.min(50, Math.max(40, lightness))}%)`;
    const secondaryBorder = `hsl(${hue}, ${Math.max(65, saturation)}%, ${Math.min(60, Math.max(45, lightness))}%)`;
    const backgroundFill = `hsla(${hue}, ${Math.max(30, saturation - 30)}%, ${Math.min(96, lightness + 45)}%, 0.95)`;
    const shadowColor = `hsl(${hue}, ${Math.max(75, saturation)}%, ${Math.max(30, lightness - 20)}%)`;
    
    const result = {
      primaryBorder,
      secondaryBorder,
      backgroundFill,
      shadowColor
    };
    
    return result;
  }
  
  // Enhanced fallback colors if parsing fails
  return {
    primaryBorder: '#3B82F6',
    secondaryBorder: '#60A5FA',
    backgroundFill: 'rgba(59, 130, 246, 0.08)',
    shadowColor: '#1D4ED8'
  };
};

export const getProcessedTimerColors = (timerId: string): ProcessedTimerColors => {
  const rawTimerColor = getTimerColor(timerId);
  return processTimerColor(rawTimerColor, timerId);
};
