
import React from 'react';
import { Button } from '@shared/components/ui/button';
import { Download, FileSpreadsheet, FileText, Crown } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TimerReportData } from '@/types';
import { useSubscription } from '@features/billing/context/SubscriptionContext';
import PremiumBadge from '@features/billing/components/PremiumBadge';

interface ExportButtonsProps {
  data: TimerReportData[];
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data }) => {
  const { subscribed, createCheckoutSession } = useSubscription();

  const handlePremiumAction = async () => {
    if (!subscribed) {
      const url = await createCheckoutSession();
      if (url) {
        window.open(url, '_blank');
      }
      return;
    }
  };

  const exportToCSV = () => {
    if (!subscribed) {
      handlePremiumAction();
      return;
    }

    try {
      const headers = [
        'Timer Name',
        'Category', 
        'Total Time',
        'Status',
        'Created Date',
        'Deleted Date',
        'Priority',
        'Deadline',
        'Tags'
      ];

      const csvData = data.map(row => [
        row.name,
        row.category,
        row.totalTime,
        row.status,
        row.createdDate,
        row.deletedDate || 'N/A',
        row.priority,
        row.deadlineDate,
        row.tags
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `timer-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const exportToExcel = () => {
    if (!subscribed) {
      handlePremiumAction();
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(
        data.map(row => ({
          'Timer Name': row.name,
          'Category': row.category,
          'Total Time': row.totalTime,
          'Status': row.status,
          'Created Date': row.createdDate,
          'Deleted Date': row.deletedDate || 'N/A',
          'Priority': row.priority,
          'Deadline': row.deadlineDate,
          'Tags': row.tags,
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Timer Report');

      // Auto-size columns
      const colWidths = [
        { wch: 20 }, // Timer Name
        { wch: 15 }, // Category
        { wch: 12 }, // Total Time
        { wch: 10 }, // Status
        { wch: 18 }, // Created Date
        { wch: 18 }, // Deleted Date
        { wch: 15 }, // Priority
        { wch: 18 }, // Deadline
        { wch: 20 }, // Tags
      ];
      worksheet['!cols'] = colWidths;

      XLSX.writeFile(workbook, `timer-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const exportToPDF = () => {
    if (!subscribed) {
      handlePremiumAction();
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Timer Report', 14, 22);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Prepare table data
      const tableData = data.map(row => [
        row.name,
        row.category,
        row.totalTime,
        row.status,
        row.createdDate,
        row.deletedDate || 'N/A',
        row.priority,
        row.deadlineDate,
        row.tags
      ]);

      // Add table using autoTable
      autoTable(doc, {
        head: [['Timer Name', 'Category', 'Total Time', 'Status', 'Created Date', 'Deleted Date', 'Priority', 'Deadline', 'Tags']],
        body: tableData,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [99, 102, 241], // Primary color
          textColor: [255, 255, 255],
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Timer Name
          1: { cellWidth: 15 }, // Category
          2: { cellWidth: 15 }, // Total Time
          3: { cellWidth: 12 }, // Status
          4: { cellWidth: 20 }, // Created Date
          5: { cellWidth: 20 }, // Deleted Date
          6: { cellWidth: 15 }, // Priority
          7: { cellWidth: 20 }, // Deadline
          8: { cellWidth: 25 }, // Tags
        },
      });

      doc.save(`timer-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative">
        <Button 
          onClick={exportToCSV} 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${!subscribed ? 'opacity-60' : ''}`}
        >
          <Download size={16} />
          CSV
          {!subscribed && <Crown size={12} />}
        </Button>
        {!subscribed && (
          <div className="absolute -top-1 -right-1">
            <PremiumBadge />
          </div>
        )}
      </div>
      
      <div className="relative">
        <Button 
          onClick={exportToExcel} 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${!subscribed ? 'opacity-60' : ''}`}
        >
          <FileSpreadsheet size={16} />
          Excel
          {!subscribed && <Crown size={12} />}
        </Button>
        {!subscribed && (
          <div className="absolute -top-1 -right-1">
            <PremiumBadge />
          </div>
        )}
      </div>
      
      <div className="relative">
        <Button 
          onClick={exportToPDF} 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${!subscribed ? 'opacity-60' : ''}`}
        >
          <FileText size={16} />
          PDF
          {!subscribed && <Crown size={12} />}
        </Button>
        {!subscribed && (
          <div className="absolute -top-1 -right-1">
            <PremiumBadge />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportButtons;
