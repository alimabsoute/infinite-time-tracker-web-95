
import React from 'react';

const CATEGORY_COLORS: { [key: string]: string } = {
  'Work': '#3b82f6',
  'Personal': '#10b981',
  'Study': '#f59e0b',
  'Exercise': '#ef4444',
  'Health': '#8b5cf6',
  'Uncategorized': '#6b7280',
};

const TimerChartLegend: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold mb-3">Timer Categories</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
          <div key={category} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-700">{category}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-600">
        <p><strong>X-axis:</strong> Total Time (hours)</p>
        <p><strong>Y-axis:</strong> Average Session Time (minutes)</p>
        <p><strong>Bubble Size:</strong> Number of Sessions</p>
      </div>
    </div>
  );
};

export default TimerChartLegend;
