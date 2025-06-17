
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

interface InsightCardProps {
  headline: string;
  takeaway: string;
  comparison: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  actionable: boolean;
  countdown?: {
    targetDate: Date;
    label: string;
  };
  realTimeUpdate?: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({
  headline,
  takeaway,
  comparison,
  value,
  icon: Icon,
  color,
  bgColor,
  actionable,
  countdown,
  realTimeUpdate = false
}) => {
  return (
    <Card className={`glass-effect hover:shadow-lg transition-all duration-200 ${realTimeUpdate ? 'animate-pulse' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div className="flex items-center gap-2">
            {actionable && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                Action needed
              </Badge>
            )}
            {realTimeUpdate && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Live
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground leading-tight">
            {headline}
          </h3>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {takeaway}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {comparison}
            </p>
          </div>
          
          <div className="pt-2 border-t border-border/30">
            <span className={`text-lg font-bold ${color}`}>
              {value}
            </span>
          </div>
          
          {countdown && (
            <div className="pt-2">
              <CountdownTimer
                targetDate={countdown.targetDate}
                label={countdown.label}
                className="w-full justify-center"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
