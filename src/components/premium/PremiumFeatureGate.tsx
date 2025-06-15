
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface PremiumFeatureGateProps {
  feature: string;
  description: string;
  children?: React.ReactNode;
  showUpgrade?: boolean;
}

const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  feature,
  description,
  children,
  showUpgrade = true
}) => {
  const { createCheckoutSession } = useSubscription();

  const handleUpgrade = async () => {
    const url = await createCheckoutSession();
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="border-2 border-dashed border-yellow-300 bg-yellow-50/50">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
          <Crown className="h-6 w-6 text-yellow-600" />
        </div>
        <CardTitle className="text-lg text-gray-700">
          <Lock className="inline mr-2 h-4 w-4" />
          {feature} - Pro Feature
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">{description}</p>
        {showUpgrade && (
          <Button onClick={handleUpgrade} className="upgrade-btn-animated">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Button>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default PremiumFeatureGate;
