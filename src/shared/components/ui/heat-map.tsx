
import React from 'react';

interface HeatMapGridProps {
  data: { day: number; hour: number; value: number }[];
  xLabels: string[];
  yLabels: string[];
  cellHeight?: string;
  cellWidth?: string;
  cellRadius?: number;
  xLabelsPos?: 'top' | 'bottom';
  yLabelsPos?: 'left' | 'right';
  cellStyle?: (x: number, y: number, value: number) => React.CSSProperties;
  cellRender?: (x: number, y: number, value: number) => React.ReactNode;
}

export const HeatMapGrid: React.FC<HeatMapGridProps> = ({
  data,
  xLabels,
  yLabels,
  cellHeight = '30px',
  cellWidth = '30px',
  cellRadius = 4,
  xLabelsPos = 'top',
  cellStyle = () => ({}),
  cellRender = (_, __, value) => value
}) => {
  // Get value for specific day and hour
  const getValue = (day: number, hour: number) => {
    const cell = data.find(item => item.day === day && item.hour === hour);
    return cell ? cell.value : 0;
  };
  
  return (
    <div className="relative">
      {/* X-axis labels (hours) */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `auto repeat(${xLabels.length}, ${cellWidth})`,
          marginBottom: xLabelsPos === 'top' ? '8px' : '0',
          marginTop: xLabelsPos === 'bottom' ? '8px' : '0'
        }}
      >
        <div></div> {/* Empty cell for corner */}
        {xLabels.map((label, idx) => (
          <div
            key={`x-label-${idx}`}
            className="text-xs text-muted-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis"
            style={{
              fontSize: '0.65rem',
              transform: 'rotate(-65deg)',
              transformOrigin: 'left top',
              width: cellWidth,
              height: '60px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingLeft: '10px',
            }}
          >
            {label}
          </div>
        ))}
      </div>
      
      {/* Main grid with y-labels and cells */}
      {yLabels.map((yLabel, day) => (
        <div
          key={`row-${day}`}
          className="grid items-center"
          style={{
            gridTemplateColumns: `auto repeat(${xLabels.length}, ${cellWidth})`,
            height: cellHeight,
          }}
        >
          {/* Y-axis label (day) */}
          <div 
            className="text-xs text-muted-foreground pr-2"
            style={{ fontSize: '0.7rem' }}
          >
            {yLabel}
          </div>
          
          {/* Cells */}
          {xLabels.map((_, hour) => {
            const value = getValue(day, hour);
            return (
              <div
                key={`cell-${day}-${hour}`}
                style={{
                  width: cellWidth,
                  height: cellHeight,
                  borderRadius: `${cellRadius}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...cellStyle(hour, day, value)
                }}
              >
                {cellRender(hour, day, value)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
