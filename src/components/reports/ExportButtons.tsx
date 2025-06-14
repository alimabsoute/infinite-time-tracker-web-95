
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TimerReportData {
  id: string;
  name: string;
  category: string;
  totalTime: string;
  totalTimeMs: number;
  status: 'Running' | 'Stopped';
  createdDate: string;
  priority: string;
  deadlineDate: string;
  tags: string;
}

interface ExportButtonsProps {
  data: TimerReportData[];
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data }) => {
  const exportToCSV = () => {
    try {
      const headers = [
        'Timer Name',
        'Category', 
        'Total Time',
        'Status',
        'Created Date',
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
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        data.map(row => ({
          'Timer Name': row.name,
          'Category': row.category,
          'Total Time': row.totalTime,
          'Status': row.status,
          'Created Date': row.createdDate,
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
        row.priority,
        row.deadlineDate,
        row.tags
      ]);

      // Add table using autoTable
      autoTable(doc, {
        head: [['Timer Name', 'Category', 'Total Time', 'Status', 'Created Date', 'Priority', 'Deadline', 'Tags']],
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
          0: { cellWidth: 25 }, // Timer Name
          1: { cellWidth: 20 }, // Category
          2: { cellWidth: 18 }, // Total Time
          3: { cellWidth: 15 }, // Status
          4: { cellWidth: 25 }, // Created Date
          5: { cellWidth: 20 }, // Priority
          6: { cellWidth: 25 }, // Deadline
          7: { cellWidth: 30 }, // Tags
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
      <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
        <Download size={16} />
        CSV
      </Button>
      <Button onClick={exportToExcel} variant="outline" size="sm" className="gap-2">
        <FileSpreadsheet size={16} />
        Excel
      </Button>
      <Button onClick={exportToPDF} variant="outline" size="sm" className="gap-2">
        <FileText size={16} />
        PDF
      </Button>
    </div>
  );
};

export default ExportButtons;
