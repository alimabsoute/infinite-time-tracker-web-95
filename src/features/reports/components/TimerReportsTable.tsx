
import { useMemo, useState } from 'react';
import { useTimerReports } from '../../hooks/useTimerReports';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/components/ui/table';
import { Badge } from '@shared/components/ui/badge';
import { Input } from '@shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import ExportButtons from './ExportButtons';
import ReportsSummary from './ReportsSummary';
import { Skeleton } from '@shared/components/ui/skeleton';

const TimerReportsTable = () => {
  const { reportData, loading } = useTimerReports();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = reportData.map(timer => timer.category);
    return ['all', ...Array.from(new Set(cats))];
  }, [reportData]);

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
      <ReportsSummary reportData={reportData} />

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
              <SelectItem value="Deleted">Deleted</SelectItem>
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
            Complete timer history including active, stopped, and deleted timers
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
                  <TableHead>Deleted Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {reportData.length === 0 ? 'No timer data available' : 'No timers match your filters'}
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
                        <Badge 
                          variant={
                            row.status === 'Running' ? 'default' : 
                            row.status === 'Deleted' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.createdDate}</TableCell>
                      <TableCell>
                        {row.deletedDate ? (
                          <span className="text-muted-foreground">{row.deletedDate}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
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
