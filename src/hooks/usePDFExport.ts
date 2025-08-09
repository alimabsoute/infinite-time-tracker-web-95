import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';

export const usePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { subscribed } = useSubscription();

  const exportToPDF = async (elementId: string, fileName: string) => {
    if (!subscribed) {
      toast.error('PDF export is a premium feature. Please upgrade to access it.');
      return;
    }

    setIsExporting(true);
    
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        toast.error('Content not found for export');
        return;
      }

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        height: element.scrollHeight,
        width: element.scrollWidth
      });

      // Calculate PDF dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = canvas.height / canvas.width;
      
      let imgWidth = pdfWidth;
      let imgHeight = pdfWidth * imgRatio;

      // If image is taller than page, fit by height
      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = pdfHeight / imgRatio;
      }

      // Center the image on the page
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`${fileName}.pdf`);
      
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPDF, isExporting };
};