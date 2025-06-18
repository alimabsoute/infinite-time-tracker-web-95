
import React from 'react';
import { Timer as TimerType } from '../../types';
import { getTimerColor } from '../../utils/timerUtils';
import TimerHeader from './TimerHeader';
import TimerEditForm from './TimerEditForm';
import TimerStatusIndicator from './TimerStatusIndicator';
import TimerContent from './TimerContent';

interface TimerCardProps {
  timer: TimerType;
  currentTime: number;
  isEditing: boolean;
  editedName: string;
  editedCategory: string;
  date: Date | undefined;
  selectedPriority: string;
  isPomodoroActive: boolean;
  currentPhase?: string;
  sessionCount: number;
  totalSessions: number;
  nameInputRef: React.RefObject<HTMLInputElement>;
  onToggle: () => void;
  onReset: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onDateSelect: (date: Date | undefined) => void;
}

// Enhanced color processing with validation and fallbacks
const processTimerColor = (rawColor: string, timerId: string): {
  primaryBorder: string;
  secondaryBorder: string;
  backgroundFill: string;
  shadowColor: string;
} => {
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

const TimerCard: React.FC<TimerCardProps> = ({
  timer,
  currentTime,
  isEditing,
  editedName,
  editedCategory,
  date,
  selectedPriority,
  isPomodoroActive,
  nameInputRef,
  onToggle,
  onReset,
  onDelete,
  onEdit,
  onSubmit,
  onCancel,
  onNameChange,
  onCategoryChange,
  onPriorityChange,
  onDateSelect,
}) => {
  const { id, name, isRunning, category, deadline } = timer;
  const rawTimerColor = getTimerColor(id);
  const isOverdue = deadline && new Date(deadline) < new Date();

  console.log('🔍 TimerCard render - Timer:', id, 'Running:', isRunning);
  console.log('🎨 Raw timer color:', rawTimerColor);

  // Process colors with validation
  const colors = processTimerColor(rawTimerColor, id);
  
  // Enhanced style objects for maximum specificity
  const primaryBorderStyle: React.CSSProperties = {
    borderColor: colors.primaryBorder,
    borderWidth: '6px',
    borderStyle: 'solid',
    boxShadow: `
      0 0 0 1px ${colors.primaryBorder},
      0 4px 20px ${colors.shadowColor}40,
      inset 0 0 20px ${colors.shadowColor}15,
      0 8px 32px ${colors.shadowColor}25
    `
  };

  const secondaryBorderStyle: React.CSSProperties = {
    borderColor: colors.secondaryBorder,
    borderWidth: '2px',
    borderStyle: 'solid'
  };

  const innerContentStyle: React.CSSProperties = {
    backgroundColor: colors.backgroundFill,
    backdropFilter: 'blur(10px)'
  };

  return (
    <article 
      className="relative group w-full max-w-[280px] h-[320px] mx-auto flex-shrink-0 p-4 transition-all duration-300 ease-in-out hover:scale-95"
      role="region"
      aria-label={`Timer for ${name}${category ? ` in category ${category}` : ''}`}
      tabIndex={0}
      style={{
        minWidth: '280px',
        minHeight: '320px'
      }}
    >
      {/* Header positioned within card boundaries at top */}
      <div className="absolute top-0 left-4 right-4 z-20 pt-2">
        <TimerHeader
          name={name}
          category={category}
          onEditClick={onEdit}
          onDeleteClick={onDelete}
        />
      </div>

      {/* Enhanced circular timer container with multiple border layers */}
      <div className="absolute top-12 left-4 right-4 bottom-4 timer-circle-container transition-all duration-300 ease-in-out group-hover:scale-95">
        
        {/* Primary border layer with enhanced styling */}
        <div 
          className={`timer-primary-border ${isRunning ? 'timer-running-animation' : ''}`}
          style={primaryBorderStyle}
        />
        
        {/* Secondary border for enhanced definition */}
        <div 
          className="timer-secondary-border"
          style={secondaryBorderStyle}
        />
        
        {/* Inner content container */}
        <div 
          className="timer-inner-content"
          style={innerContentStyle}
        >
          {/* Edit Form Overlay */}
          {isEditing && (
            <div className="absolute inset-4 z-30 flex items-center justify-center">
              <div className="bg-black/70 backdrop-blur-xl rounded-full p-6 w-full h-full flex items-center justify-center">
                <div className="w-full max-w-xs">
                  <TimerEditForm
                    nameInputRef={nameInputRef}
                    editedName={editedName}
                    editedCategory={editedCategory}
                    onNameChange={onNameChange}
                    onCategoryChange={onCategoryChange}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Timer Content */}
          {!isEditing && (
            <div className="w-full h-full flex items-center justify-center">
              <TimerContent
                timerId={id}
                currentTime={currentTime}
                isRunning={isRunning}
                category={category}
                timerColor={colors.primaryBorder}
                selectedPriority={selectedPriority}
                date={date}
                isOverdue={!!isOverdue}
                onToggle={onToggle}
                onReset={onReset}
                onPriorityChange={onPriorityChange}
                onDateSelect={onDateSelect}
              />
            </div>
          )}
          
          {/* Status Indicator positioned within circle */}
          <div className="absolute top-2 right-2 z-10">
            <TimerStatusIndicator
              isRunning={isRunning}
              isPomodoroActive={isPomodoroActive}
              timerColor={colors.primaryBorder}
            />
          </div>

          {/* Enhanced running indicator pulse */}
          {isRunning && (
            <div 
              className="absolute top-1 right-1 w-3 h-3 rounded-full animate-pulse z-20"
              style={{ 
                backgroundColor: colors.primaryBorder,
                boxShadow: `0 0 10px ${colors.shadowColor}50`
              }}
            />
          )}
        </div>
      </div>
      
      {/* Debug border for development - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="absolute top-12 left-4 right-4 bottom-4 pointer-events-none z-50"
          style={{
            border: '2px dashed rgba(255, 0, 0, 0.3)',
            borderRadius: '50%'
          }}
        />
      )}
    </article>
  );
};

export default TimerCard;
