
import { getTimerColor } from './timerUtils';

export interface ProcessedTimerColors {
  primaryBorder: string;
  secondaryBorder: string;
  backgroundFill: string;
  shadowColor: string;
}

export const processTimerColor = (rawColor: string, timerId: string): ProcessedTimerColors => {
  console.log('🎨 Processing timer color for:', timerId, 'Raw color:', rawColor);
  
  // Validate and process the color
  let processedColor = rawColor;
  
  // Extract HSL values with improved parsing
  const hslMatch = processedColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  
  if (hslMatch) {
    const [, h, s, l] = hslMatch;
    const hue = parseInt(h);
    const saturation = parseInt(s);
    const lightness = parseInt(l);
    
    console.log('🔧 Parsed HSL values:', { hue, saturation, lightness });
    
    // Create strong, visible colors
    const primaryBorder = `hsl(${hue}, ${Math.max(80, saturation)}%, ${Math.min(50, Math.max(40, lightness))}%)`;
    const secondaryBorder = `hsl(${hue}, ${Math.max(60, saturation)}%, ${Math.min(60, Math.max(45, lightness))}%)`;
    const backgroundFill = `hsla(${hue}, ${Math.max(30, saturation - 30)}%, ${Math.min(95, lightness + 40)}%, 0.95)`;
    const shadowColor = `hsl(${hue}, ${Math.max(70, saturation)}%, ${Math.max(30, lightness - 20)}%)`;
    
    const result = {
      primaryBorder,
      secondaryBorder,
      backgroundFill,
      shadowColor
    };
    
    console.log('✅ Processed colors:', result);
    return result;
  }
  
  // Fallback colors if parsing fails
  console.log('⚠️ Color parsing failed, using fallback colors');
  return {
    primaryBorder: '#3B82F6',
    secondaryBorder: '#60A5FA',
    backgroundFill: 'rgba(59, 130, 246, 0.1)',
    shadowColor: '#1D4ED8'
  };
};

export const getProcessedTimerColors = (timerId: string): ProcessedTimerColors => {
  const rawTimerColor = getTimerColor(timerId);
  return processTimerColor(rawTimerColor, timerId);
};
