
import React from 'react';

interface BubbleChartLegendProps {
  bubblesCount: number;
}

export const BubbleChartLegend: React.FC<BubbleChartLegendProps> = ({
  bubblesCount
}) => {
  return (
    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
      <div className="text-white text-xs space-y-1">
        <div className="font-semibold mb-2">3D Bubble Chart</div>
        <div>• Bubble size = Total time logged</div>
        <div>• X-axis = Timer creation date</div>
        <div>• Colors = Categories</div>
        <div className="text-slate-300 mt-2">Showing {bubblesCount} timers</div>
      </div>
    </div>
  );
};

export default BubbleChartLegend;
