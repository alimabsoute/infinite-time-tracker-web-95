
import React from 'react';

type VisualizationMode = '3d' | '2d' | 'bar';

interface ValidationResult {
  validSessionsCount: number;
  timerGroupsCount: number;
}

interface VisualizationDebugInfoProps {
  currentMode: VisualizationMode;
  has3DSupport: boolean;
  dataValidation: ValidationResult | null;
}

export const VisualizationDebugInfo: React.FC<VisualizationDebugInfoProps> = ({
  currentMode,
  has3DSupport,
  dataValidation
}) => {
  if (process.env.NODE_ENV !== 'development' || !dataValidation) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
      <strong>Debug:</strong> Mode: {currentMode}, 3D Support: {has3DSupport ? 'Yes' : 'No'}, 
      Valid Sessions: {dataValidation.validSessionsCount}, 
      Timer Groups: {dataValidation.timerGroupsCount}
    </div>
  );
};

export default VisualizationDebugInfo;
