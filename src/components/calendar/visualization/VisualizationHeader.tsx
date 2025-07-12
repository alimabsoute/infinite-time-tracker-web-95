
import React from 'react';
import { format } from 'date-fns';
import { Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface VisualizationHeaderProps {
  dataValidation: any;
  fallbackHistory: string[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

const VisualizationHeader: React.FC<VisualizationHeaderProps> = ({
  dataValidation,
  fallbackHistory,
  dateRange
}) => {
  const hasValidData = dataValidation?.hasValidData;
  const validSessionsCount = dataValidation?.validSessionsCount || 0;
  const timerGroupsCount = dataValidation?.timerGroupsCount || 0;
  
  return (
    <div className="p-4 border-b border-border/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Multi-Layer Visualization</h3>
          {hasValidData ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {dateRange && (
            <Badge variant="outline" className="text-xs">
              {format(dateRange.startDate, 'MMM dd')} - {format(dateRange.endDate, 'MMM dd')}
            </Badge>
          )}
          
          {hasValidData && (
            <>
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Database className="h-3 w-3" />
                {validSessionsCount} sessions
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {timerGroupsCount} timers
              </Badge>
            </>
          )}
          
          {fallbackHistory.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              Fallbacks: {fallbackHistory.length}
            </Badge>
          )}
        </div>
      </div>
      
      {!hasValidData && (
        <p className="text-sm text-muted-foreground mt-2">
          No timer data found for the selected date range. Try selecting a different period or create some timer sessions.
        </p>
      )}
    </div>
  );
};

export default VisualizationHeader;
