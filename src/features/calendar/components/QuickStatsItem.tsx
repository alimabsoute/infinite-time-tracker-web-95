
import React from 'react';
import { Card, CardContent } from "@shared/components/ui/card";
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickStatsItemProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const QuickStatsItem: React.FC<QuickStatsItemProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full bg-gradient-to-br from-background to-muted/30 border-border/40 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon 
                  size={16} 
                  className={color}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {title}
                </span>
              </div>
              
              <div className="mb-1">
                <span className="text-2xl font-bold text-foreground">
                  {value}
                </span>
              </div>
              
              {subtitle && (
                <div className="text-xs text-muted-foreground mb-2">
                  {subtitle}
                </div>
              )}
              
              {trend && (
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs last week
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickStatsItem;
