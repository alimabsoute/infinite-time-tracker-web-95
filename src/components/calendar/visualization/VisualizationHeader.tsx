
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";

interface ValidationResult {
  validSessionsCount: number;
}

interface VisualizationHeaderProps {
  dataValidation: ValidationResult | null;
}

export const VisualizationHeader: React.FC<VisualizationHeaderProps> = ({
  dataValidation
}) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>Weekly Activity Visualization</span>
        <div className="text-sm text-muted-foreground">
          Data: {dataValidation?.validSessionsCount || 0} sessions
        </div>
      </CardTitle>
    </CardHeader>
  );
};

export default VisualizationHeader;
