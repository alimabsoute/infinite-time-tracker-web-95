
import React from 'react';
import Header from '../components/Header';
import TimerReportsTable from '../components/reports/TimerReportsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/contexts/SubscriptionContext';
import PremiumFeatureGate from '../components/premium/PremiumFeatureGate';
import PremiumBadge from '../components/premium/PremiumBadge';

const Reports = () => {
  const { subscribed } = useSubscription();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Timer Reports</h1>
              {!subscribed && <PremiumBadge />}
            </div>
            <p className="text-muted-foreground">
              View, analyze, and export your timer data in spreadsheet format
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Timer Data Overview</CardTitle>
                  <CardDescription>
                    Complete overview of all your timer sessions with export capabilities
                  </CardDescription>
                </div>
                {!subscribed && <PremiumBadge />}
              </div>
            </CardHeader>
            <CardContent>
              {subscribed ? (
                <TimerReportsTable />
              ) : (
                <PremiumFeatureGate 
                  feature="Advanced Reports & Data Export" 
                  description="Access comprehensive timer reports with advanced filtering, sorting, and export capabilities to CSV, Excel, and PDF formats."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;
