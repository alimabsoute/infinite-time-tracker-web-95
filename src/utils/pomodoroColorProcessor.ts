
export interface ProcessedPomodoroColors {
  primaryBorder: string;
  secondaryBorder: string;
  backgroundFill: string;
  shadowColor: string;
}

export const processPomodoroColor = (rawColor: string, phase: string): ProcessedPomodoroColors => {
  console.log('🍅 Processing Pomodoro color for phase:', phase, 'Raw color:', rawColor);
  
  // Handle hex colors by converting to HSL
  if (rawColor.startsWith('#')) {
    const hex = rawColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
      
      switch (max) {
        case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
        case g: h = (b - r) / diff + 2; break;
        case b: h = (r - g) / diff + 4; break;
      }
      h /= 6;
    }
    
    const hue = Math.round(h * 360);
    const saturation = Math.round(s * 100);
    const lightness = Math.round(l * 100);
    
    console.log('🔧 Converted hex to HSL:', { hue, saturation, lightness });
    
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
    
    console.log('✅ Processed Pomodoro colors from hex:', result);
    return result;
  }
  
  // Extract HSL values with improved parsing
  const hslMatch = rawColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  
  if (hslMatch) {
    const [, h, s, l] = hslMatch;
    const hue = parseInt(h);
    const saturation = parseInt(s);
    const lightness = parseInt(l);
    
    console.log('🔧 Parsed Pomodoro HSL values:', { hue, saturation, lightness });
    
    // Create vibrant colors suitable for circular cards
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
  
  // Phase-based fallback colors for Pomodoro
  console.log('⚠️ Pomodoro color parsing failed, using phase-based fallback for:', phase);
  
  if (phase === 'work') {
    return {
      primaryBorder: '#DC2626',
      secondaryBorder: '#F87171',
      backgroundFill: 'rgba(220, 38, 38, 0.08)',
      shadowColor: '#B91C1C'
    };
  } else if (phase === 'short-break' || phase === 'long-break') {
    return {
      primaryBorder: '#059669',
      secondaryBorder: '#34D399',
      backgroundFill: 'rgba(5, 150, 105, 0.08)',
      shadowColor: '#047857'
    };
  }
  
  return {
    primaryBorder: '#6B7280',
    secondaryBorder: '#9CA3AF',
    backgroundFill: 'rgba(107, 114, 128, 0.08)',
    shadowColor: '#4B5563'
  };
};
