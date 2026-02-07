
import { getTimerColor } from './timerUtils';

export interface ProcessedTimerColors {
  primaryBorder: string;
  secondaryBorder: string;
  backgroundFill: string;
  shadowColor: string;
}

export const processTimerColor = (rawColor: string, timerId: string): ProcessedTimerColors => {
  const hslMatch = rawColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);

  if (hslMatch) {
    const [, h, s, l] = hslMatch;
    const hue = parseInt(h);
    const saturation = parseInt(s);
    const lightness = parseInt(l);

    return {
      primaryBorder: `hsl(${hue}, ${Math.max(85, saturation)}%, ${Math.min(50, Math.max(40, lightness))}%)`,
      secondaryBorder: `hsl(${hue}, ${Math.max(65, saturation)}%, ${Math.min(60, Math.max(45, lightness))}%)`,
      backgroundFill: `hsla(${hue}, ${Math.max(30, saturation - 30)}%, ${Math.min(96, lightness + 45)}%, 0.95)`,
      shadowColor: `hsl(${hue}, ${Math.max(75, saturation)}%, ${Math.max(30, lightness - 20)}%)`,
    };
  }

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
