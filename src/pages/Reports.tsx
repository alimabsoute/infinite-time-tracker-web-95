
import React from 'react';
import Header from '../components/Header';
import TimerReportsTable from '../components/reports/TimerReportsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Reports = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Timer Reports</h1>
            <p className="text-muted-foreground">
              View, analyze, and export your timer data in spreadsheet format
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Timer Data Overview</CardTitle>
              <CardDescription>
                Complete overview of all your timer sessions with export capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimerReportsTable />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;
