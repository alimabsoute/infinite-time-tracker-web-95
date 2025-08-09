import React from 'react';
import { Button } from './button';
import { Download, Loader2 } from 'lucide-react';
import { usePDFExport } from '@/hooks/usePDFExport';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface PDFExportButtonProps {
  elementId: string;
  fileName: string;
  className?: string;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  elementId,
  fileName,
  className
}) => {
  const { exportToPDF, isExporting } = usePDFExport();
  const { subscribed } = useSubscription();

  const handleExport = () => {
    exportToPDF(elementId, fileName);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={subscribed ? "default" : "outline"}
      size="sm"
      className={className}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isExporting ? 'Exporting...' : 'Export PDF'}
    </Button>
  );
};