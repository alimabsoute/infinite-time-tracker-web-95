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
    if (url) window.open(url, '_blank');
  };

  return (
    <div className={`p-4 rounded-lg border ${isAtLimit ? 'border-destructive/30 bg-destructive/5' : isNearLimit ? 'border-amber-300/50 bg-amber-50/50' : 'border-border bg-muted/30'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">Timer Usage</span>
        <span className="text-sm text-muted-foreground">{currentCount}/{limit}</span>
      </div>

      <Progress
        value={percentage}
        className={`mb-3 ${isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-amber-500' : ''}`}
      />

      {isAtLimit ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-destructive">Timer limit reached</p>
          <Button onClick={handleUpgrade} size="sm" className="gap-1.5">
            <Crown className="h-3.5 w-3.5" />
            Upgrade to Pro
          </Button>
        </div>
      ) : isNearLimit ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-amber-700">Almost at your limit</p>
          <Button onClick={handleUpgrade} variant="outline" size="sm" className="gap-1.5">
            <Crown className="h-3.5 w-3.5" />
            Go Pro
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default TimerLimitIndicator;
