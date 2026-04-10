
import React from 'react';
import { Button } from "@shared/components/ui/button";

interface ClearDataControlsProps {
  subscribed: boolean;
  isClearing: boolean;
  onClearMockTimers: () => void;
  onForceClearAllTimers: () => void;
}

const ClearDataControls: React.FC<ClearDataControlsProps> = ({
  subscribed,
  isClearing,
  onClearMockTimers,
  onForceClearAllTimers
}) => {
  if (subscribed) {
    return (
      <div className="mb-6 flex justify-end">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearMockTimers}
            disabled={isClearing}
          >
            {isClearing ? "Clearing..." : "Clear Mock Data"}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onForceClearAllTimers}
            disabled={isClearing}
            title="Force clear ALL timers (use with caution)"
          >
            🗑️ Force Clear
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-muted border border-border rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-foreground">Free Plan</h3>
          <p className="text-sm text-muted-foreground">
            Upgrade for unlimited timers and premium features.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onClearMockTimers}
            disabled={isClearing}
          >
            {isClearing ? "Clearing..." : "Clear Mock Data"}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onForceClearAllTimers}
            disabled={isClearing}
            title="Force clear ALL timers (use with caution)"
          >
            🗑️
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClearDataControls;
