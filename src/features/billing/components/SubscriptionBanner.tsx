
import React from 'react';
import { Button } from "@shared/components/ui/button";
import TimerLimitIndicator from './TimerLimitIndicator';

interface SubscriptionBannerProps {
  subscribed: boolean;
  timersCount: number;
  getTimerLimit: () => number;
  onUpgrade: () => void;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  subscribed,
  timersCount,
  getTimerLimit,
  onUpgrade
}) => {
  if (subscribed) return null;

  return (
    <>
      {/* Premium Timer Limit Indicator */}
      <div className="mb-6">
        <TimerLimitIndicator currentCount={timersCount} />
      </div>

      {/* Subscription Status Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-blue-900">Free Plan</h3>
            <p className="text-sm text-blue-700">
              {timersCount}/{getTimerLimit()} timers used. Upgrade for unlimited timers and premium features.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={onUpgrade}
          >
            Upgrade
          </Button>
        </div>
      </div>
    </>
  );
};

export default SubscriptionBanner;
