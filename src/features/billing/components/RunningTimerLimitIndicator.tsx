
import React from 'react';
import { Progress } from '@shared/components/ui/progress';
import { Button } from '@shared/components/ui/button';
import { Play, Crown } from 'lucide-react';
import { useSubscription } from '@features/billing/context/SubscriptionContext';

interface RunningTimerLimitIndicatorProps {
  currentRunningCount: number;
}

const RunningTimerLimitIndicator: React.FC<RunningTimerLimitIndicatorProps> = ({ currentRunningCount }) => {
  const { getRunningTimerLimit, subscribed, createCheckoutSession } = useSubscription();

  if (subscribed) return null;

  const limit = getRunningTimerLimit();
  const percentage = (currentRunningCount / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentRunningCount >= limit;

  const handleUpgrade = async () => {
    const url = await createCheckoutSession();
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${isNearLimit ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          <span className="text-sm font-medium">Running Timers</span>
        </div>
        <span className="text-sm text-muted-foreground">{currentRunningCount}/{limit}</span>
      </div>
      
      <Progress 
        value={percentage} 
        className={`mb-3 ${isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
      />
      
      {isAtLimit ? (
        <div className="text-center">
          <p className="text-sm text-orange-600 mb-2">Running timer limit reached!</p>
          <Button onClick={handleUpgrade} size="sm" className="upgrade-btn-animated">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Pro for Unlimited Running Timers
          </Button>
        </div>
      ) : isNearLimit ? (
        <div className="text-center">
          <p className="text-sm text-orange-700 mb-2">Almost at your running timer limit</p>
          <Button onClick={handleUpgrade} variant="outline" size="sm">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default RunningTimerLimitIndicator;
