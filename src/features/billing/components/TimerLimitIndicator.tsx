
import React from 'react';
import { Progress } from '@shared/components/ui/progress';
import { Button } from '@shared/components/ui/button';
import { Crown } from 'lucide-react';
import { useSubscription } from '@features/billing/context/SubscriptionContext';

interface TimerLimitIndicatorProps {
  currentCount: number;
}

const TimerLimitIndicator: React.FC<TimerLimitIndicatorProps> = ({ currentCount }) => {
  const { getTimerLimit, subscribed, createCheckoutSession } = useSubscription();

  if (subscribed) return null;

  const limit = getTimerLimit();
  const percentage = (currentCount / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentCount >= limit;

  const handleUpgrade = async () => {
    const url = await createCheckoutSession();
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${isNearLimit ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Timer Usage</span>
        <span className="text-sm text-muted-foreground">{currentCount}/{limit}</span>
      </div>
      
      <Progress 
        value={percentage} 
        className={`mb-3 ${isNearLimit ? '[&>div]:bg-yellow-500' : ''}`}
      />
      
      {isAtLimit ? (
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">Timer limit reached!</p>
          <Button onClick={handleUpgrade} size="sm" className="upgrade-btn-animated">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Pro for Unlimited Timers
          </Button>
        </div>
      ) : isNearLimit ? (
        <div className="text-center">
          <p className="text-sm text-yellow-700 mb-2">Almost at your timer limit</p>
          <Button onClick={handleUpgrade} variant="outline" size="sm">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default TimerLimitIndicator;
