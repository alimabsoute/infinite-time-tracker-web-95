
import React from 'react';
import { Badge } from '@shared/components/ui/badge';
import { Crown } from 'lucide-react';

const PremiumBadge: React.FC = () => {
  return (
    <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50">
      <Crown className="mr-1 h-3 w-3" />
      Pro
    </Badge>
  );
};

export default PremiumBadge;
