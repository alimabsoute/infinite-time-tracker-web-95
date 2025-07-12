
import React from 'react';
import { FOOD_CATEGORIES } from '../../utils/foodManufacturerData';

const ChartLegend: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold mb-3">Product Categories</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(FOOD_CATEGORIES).map(([category, color]) => (
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
        <p><strong>X-axis:</strong> Production Volume (tons/year)</p>
        <p><strong>Y-axis:</strong> Profit Margin (%)</p>
        <p><strong>Bubble Size:</strong> Market Share (%)</p>
      </div>
    </div>
  );
};

export default ChartLegend;
