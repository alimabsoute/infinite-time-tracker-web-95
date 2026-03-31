
import React from 'react';
import { Button } from '@shared/components/ui/button';
import { Home } from 'lucide-react';

interface ChartControlsProps {
  onResetCamera: () => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({ onResetCamera }) => {
  return (
    <>
      {/* Reset/Home button */}
      <Button
        onClick={onResetCamera}
        size="sm"
        variant="outline"
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm"
      >
        <Home className="h-4 w-4" />
      </Button>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="font-semibold mb-2">3D Bubble Chart</div>
        <div className="space-y-1">
          <div>• X-axis: Total time logged</div>
          <div>• Y-axis: Average session time</div>
          <div>• Size: Number of sessions</div>
          <div>• Colors: Timer categories</div>
        </div>
      </div>
    </>
  );
};

export default ChartControls;
