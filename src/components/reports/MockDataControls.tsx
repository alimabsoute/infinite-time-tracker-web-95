import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMockDataManager } from '@/hooks/useMockDataManager';
import { Database, Trash2, Plus, Info } from 'lucide-react';

const MockDataControls: React.FC = () => {
  const { generateMockData, clearMockData, isGenerating, isClearing } = useMockDataManager();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <CardTitle>Mock Data Management</CardTitle>
          <Badge variant="secondary">Demo Features</Badge>
        </div>
        <CardDescription>
          Generate realistic sample data to explore all features, or clear existing mock data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">What gets generated:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>10 realistic timers across Work, Study, Exercise, and Personal categories</li>
                <li>60+ timer sessions distributed over the past 20 days</li>
                <li>Varied session durations and times of day based on category</li>
                <li>Complete data for testing Reports, Calendar, and Analytics features</li>
              </ul>
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={generateMockData}
              disabled={isGenerating || isClearing}
              variant="default"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Mock Data'}
            </Button>
            
            <Button
              onClick={clearMockData}
              disabled={isGenerating || isClearing}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? 'Clearing...' : 'Clear Mock Data'}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Mock data will have "Mock" prefix in timer names for easy identification.
            All features work the same with both real and mock data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MockDataControls;