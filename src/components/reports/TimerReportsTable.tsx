import React, { useMemo, useState } from 'react';
import { useTimers } from '../../hooks/useTimers';
import { Timer } from '../../types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExportButtons from './ExportButtons';
import ReportsSummary from './ReportsSummary';
import { Skeleton } from '@/components/ui/skeleton';

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

const TimerReportsTable = () => {
  const { timers, loading } = useTimers();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Move formatTime function to the top before it's used
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format timer data for the table
  const reportData: TimerReportData[] = useMemo(() => {
    return timers.map((timer: Timer) => ({
      id: timer.id,
      name: timer.name,
      category: timer.category || 'Uncategorized',
      totalTime: formatTime(timer.elapsedTime),
      totalTimeMs: timer.elapsedTime,
      status: timer.isRunning ? 'Running' : 'Stopped',
      createdDate: format(timer.createdAt, 'yyyy-MM-dd HH:mm'),
      priority: timer.priority ? `Priority ${timer.priority}` : 'No Priority',
      deadlineDate: timer.deadline ? format(timer.deadline, 'yyyy-MM-dd HH:mm') : 'No Deadline',
      tags: timer.tags ? timer.tags.join(', ') : 'No Tags',
    }));
  }, [timers]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = timers.map(timer => timer.category || 'Uncategorized');
    return ['all', ...Array.from(new Set(cats))];
  }, [timers]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [reportData, searchTerm, categoryFilter, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <ReportsSummary timers={timers} />

      {/* Filters and Export */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4 flex-1">
          <Input
            placeholder="Search timers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Running">Running</SelectItem>
              <SelectItem value="Stopped">Stopped</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ExportButtons data={filteredData} />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Timer Data ({filteredData.length} entries)</CardTitle>
          <CardDescription>
            Detailed view of all timer sessions with filtering and export options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timer Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {timers.length === 0 ? 'No timer data available' : 'No timers match your filters'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.category}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">{row.totalTime}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === 'Running' ? 'default' : 'secondary'}>
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.createdDate}</TableCell>
                      <TableCell>{row.priority}</TableCell>
                      <TableCell>{row.deadlineDate}</TableCell>
                      <TableCell>{row.tags}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimerReportsTable;
