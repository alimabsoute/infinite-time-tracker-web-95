
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import TimerReportsTable from '../components/reports/TimerReportsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/contexts/SubscriptionContext';
import PremiumFeatureGate from '../components/premium/PremiumFeatureGate';
import PremiumBadge from '../components/premium/PremiumBadge';

const Reports = () => {
  const { subscribed } = useSubscription();

  return (
    <PageLayout 
      title="Timer Reports"
      description="View, analyze, and export your timer data in spreadsheet format"
    >
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
    </PageLayout>
  );
};

export default Reports;
