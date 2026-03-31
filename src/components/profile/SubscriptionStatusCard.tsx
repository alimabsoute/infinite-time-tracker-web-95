import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, CreditCard, Timer } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTimers } from '@/hooks/useTimers';
import PremiumBadge from '@/components/premium/PremiumBadge';

const SubscriptionStatusCard: React.FC = () => {
  const { 
    subscribed, 
    subscriptionTier, 
    getTimerLimit, 
    getRunningTimerLimit,
    createCheckoutSession,
    createCustomerPortalSession 
  } = useSubscription();
  const { timers } = useTimers();

  const currentTimerCount = timers.length;
  const runningTimerCount = timers.filter(t => t.isRunning).length;
  const timerLimit = getTimerLimit();
  const runningTimerLimit = getRunningTimerLimit();

  const handleUpgrade = async () => {
    const url = await createCheckoutSession();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleManageBilling = async () => {
    const url = await createCustomerPortalSession();
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription Plan
          </CardTitle>
          {subscribed ? (
            <PremiumBadge />
          ) : (
            <Badge variant="secondary">Free</Badge>
          )}
        </div>
        <CardDescription>
          {subscribed 
            ? `You're on the ${subscriptionTier || 'Pro'} plan with unlimited features.`
            : 'You\'re on the free plan with limited features.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Statistics */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Usage Statistics
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Timers</span>
                <span className="font-medium">
                  {currentTimerCount}/{subscribed ? 'Unlimited' : timerLimit}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ 
                    width: subscribed ? '100%' : `${Math.min((currentTimerCount / timerLimit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Running Timers</span>
                <span className="font-medium">
                  {runningTimerCount}/{subscribed ? 'Unlimited' : runningTimerLimit}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: subscribed ? '100%' : `${Math.min((runningTimerCount / runningTimerLimit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="space-y-3">
          <h4 className="font-medium">Plan Features</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Timer Limit</span>
              <span className="font-medium">{subscribed ? 'Unlimited' : `${timerLimit} timers`}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Running Timer Limit</span>
              <span className="font-medium">{subscribed ? 'Unlimited' : `${runningTimerLimit} concurrent`}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Advanced Analytics</span>
              <span className="font-medium">{subscribed ? '✓' : '✗'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Priority Support</span>
              <span className="font-medium">{subscribed ? '✓' : '✗'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t space-y-2">
          {subscribed ? (
            <div className="space-y-2">
              <Button 
                onClick={handleManageBilling}
                variant="outline"
                className="w-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Billing
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Manage your subscription, payment methods, and download invoices
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={handleUpgrade}
                className="w-full upgrade-btn-animated"
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Get unlimited timers and advanced features for $7.99/month
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;