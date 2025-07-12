
import React from 'react';
import { format } from 'date-fns';

interface VisualizationDebugInfoProps {
  currentMode: string;
  has3DSupport: boolean;
  dataValidation: any;
  fallbackHistory: string[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

const VisualizationDebugInfo: React.FC<VisualizationDebugInfoProps> = ({
  currentMode,
  has3DSupport,
  dataValidation,
  fallbackHistory,
  dateRange
}) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
      <div className="font-mono space-y-1">
        <div><strong>Mode:</strong> {currentMode}</div>
        <div><strong>3D Support:</strong> {has3DSupport ? 'Yes' : 'No'}</div>
        <div><strong>Valid Data:</strong> {dataValidation?.hasValidData ? 'Yes' : 'No'}</div>
        <div><strong>Sessions:</strong> {dataValidation?.validSessionsCount || 0}</div>
        <div><strong>Timer Groups:</strong> {dataValidation?.timerGroupsCount || 0}</div>
        <div><strong>Fallback History:</strong> {fallbackHistory.join(' → ') || 'None'}</div>
        {dateRange && (
          <div><strong>Date Range:</strong> {format(dateRange.startDate, 'MMM dd')} - {format(dateRange.endDate, 'MMM dd')}</div>
        )}
        {dataValidation?.errors && dataValidation.errors.length > 0 && (
          <div><strong>Errors:</strong> {dataValidation.errors.join(', ')}</div>
        )}
      </div>
    </div>
  );
};

export default VisualizationDebugInfo;
