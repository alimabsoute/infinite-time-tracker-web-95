
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface VisualizationHeaderProps {
  dataValidation?: any;
  fallbackHistory?: string[];
}

const VisualizationHeader: React.FC<VisualizationHeaderProps> = ({
  dataValidation,
  fallbackHistory = []
}) => {
  const getStatusInfo = () => {
    if (!dataValidation) {
      return { icon: Info, color: 'bg-blue-500', text: 'Loading...', description: 'Preparing visualization data' };
    }
    
    if (!dataValidation.hasValidData) {
      return { 
        icon: AlertTriangle, 
        color: 'bg-yellow-500', 
        text: 'No Data', 
        description: 'No timer sessions found for visualization' 
      };
    }
    
    if (fallbackHistory.length > 0) {
      return { 
        icon: AlertTriangle, 
        color: 'bg-orange-500', 
        text: 'Fallback Active', 
        description: `Using fallback after ${fallbackHistory.join(' → ')} failed` 
      };
    }
    
    return { 
      icon: CheckCircle, 
      color: 'bg-green-500', 
      text: 'Ready', 
      description: `${dataValidation.timerGroupsCount} timers visualized` 
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          Weekly Timer Visualization
        </CardTitle>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <StatusIcon size={12} className="text-current" />
            {statusInfo.text}
          </Badge>
          
          {dataValidation?.hasValidData && (
            <Badge variant="secondary">
              {dataValidation.validSessionsCount} sessions
            </Badge>
          )}
        </div>
      </div>
      
      {statusInfo.description && (
        <p className="text-sm text-muted-foreground mt-1">
          {statusInfo.description}
        </p>
      )}
    </CardHeader>
  );
};

export default VisualizationHeader;
