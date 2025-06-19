
export interface ProcessedPomodoroColors {
  primaryBorder: string;
  secondaryBorder: string;
  backgroundFill: string;
  shadowColor: string;
}

export const processPomodoroColor = (rawColor: string, phase: string): ProcessedPomodoroColors => {
  console.log('🍅 Processing Pomodoro color for phase:', phase, 'Raw color:', rawColor);
  
  // Extract HSL values
  const hslMatch = rawColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  
  if (hslMatch) {
    const [, h, s, l] = hslMatch;
    const hue = parseInt(h);
    const saturation = parseInt(s);
    const lightness = parseInt(l);
    
    console.log('🔧 Parsed Pomodoro HSL values:', { hue, saturation, lightness });
    
    // Create vibrant colors suitable for rectangular cards
    const primaryBorder = `hsl(${hue}, ${Math.max(85, saturation)}%, ${Math.min(55, Math.max(45, lightness))}%)`;
    const secondaryBorder = `hsl(${hue}, ${Math.max(65, saturation)}%, ${Math.min(65, Math.max(50, lightness))}%)`;
    const backgroundFill = `hsla(${hue}, ${Math.max(35, saturation - 25)}%, ${Math.min(96, lightness + 45)}%, 0.92)`;
    const shadowColor = `hsl(${hue}, ${Math.max(75, saturation)}%, ${Math.max(35, lightness - 15)}%)`;
    
    const result = {
      primaryBorder,
      secondaryBorder,
      backgroundFill,
      shadowColor
    };
    
    console.log('✅ Processed Pomodoro colors:', result);
    return result;
  }
  
  // Fallback colors for Pomodoro
  console.log('⚠️ Pomodoro color parsing failed, using fallback');
  return {
    primaryBorder: '#DC2626',
    secondaryBorder: '#F87171',
    backgroundFill: 'rgba(220, 38, 38, 0.08)',
    shadowColor: '#B91C1C'
  };
};
