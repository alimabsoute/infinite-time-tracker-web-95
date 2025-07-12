
import React, { useState } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BubbleChart3DFixed from './visualization/BubbleChart3DFixed';
import Bubble2DChart from './visualization/Bubble2DChart';
import DateRangeSync from './visualization/DateRangeSync';
import { generateMockVisualizationData } from '../../utils/mockVisualizationData';
import { Play, Pause, RotateCcw, CheckCircle, Database, Eye } from 'lucide-react';

interface VisualizationDemoProps {
  sessions?: any[]; // Made optional since we're using mock data
}

export const VisualizationDemo: React.FC<VisualizationDemoProps> = () => {
  // Generate mock data on component initialization
  const [mockSessions] = useState(() => generateMockVisualizationData());
  
  // Demo state
  const [visualizationStart, setVisualizationStart] = useState(() => subDays(new Date(), 7));
  const [visualizationEnd, setVisualizationEnd] = useState(() => new Date());
  const [weeklyActivityDate, setWeeklyActivityDate] = useState(() => new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeVisualization, setActiveVisualization] = useState<'3d' | '2d'>('3d');

  console.log('🔍 VisualizationDemo - Using mock data:', {
    sessionsCount: mockSessions.length,
    uniqueTimers: new Set(mockSessions.map(s => s.timer_id)).size,
    categories: [...new Set(mockSessions.map(s => s.timers?.category))]
  });

  const demoSteps = [
    {
      title: "Initial State",
      description: "Visualization shows last 7 days with 50 mock timer sessions",
      action: () => {
        setVisualizationStart(subDays(new Date(), 7));
        setVisualizationEnd(new Date());
        setWeeklyActivityDate(new Date());
      }
    },
    {
      title: "Change Visualization Range",
      description: "Change visualization to show last 3 days (focused view)",
      action: () => {
        setVisualizationStart(subDays(new Date(), 3));
        setVisualizationEnd(new Date());
      }
    },
    {
      title: "Toggle to 2D View", 
      description: "Switch to 2D bubble chart for compatibility",
      action: () => {
        setActiveVisualization('2d');
      }
    },
    {
      title: "Back to 3D View",
      description: "Return to 3D visualization",
      action: () => {
        setActiveVisualization('3d');
      }
    }
  ];

  const handlePlayDemo = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setCurrentStep(0);
    
    const runStep = (stepIndex: number) => {
      if (stepIndex >= demoSteps.length) {
        setIsPlaying(false);
        return;
      }
      
      demoSteps[stepIndex].action();
      setCurrentStep(stepIndex);
      
      setTimeout(() => {
        runStep(stepIndex + 1);
      }, 3000);
    };
    
    runStep(0);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setActiveVisualization('3d');
    demoSteps[0].action();
  };

  const handleVisualizationDateChange = (startDate: Date, endDate: Date) => {
    setVisualizationStart(startDate);
    setVisualizationEnd(endDate);
  };

  const handleSyncDates = async (startDate: Date, endDate: Date) => {
    setWeeklyActivityDate(startDate);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleBubbleClick = (bubble: any) => {
    console.log('🔍 VisualizationDemo - Bubble clicked:', bubble);
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Working Bubble Chart Demo - Mock Data Implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Database className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-blue-700 font-medium">Using Mock Data</p>
              <p className="text-blue-600 text-sm">
                50 realistic timer sessions across 10 days with 6 categories and 25 unique timers
              </p>
            </div>
            <Badge variant="secondary">{mockSessions.length} sessions</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePlayDemo}
              variant={isPlaying ? "destructive" : "default"}
              size="sm"
            >
              {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isPlaying ? "Stop Demo" : "Play Demo"}
            </Button>
            
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            {isPlaying && (
              <Badge variant="secondary">
                Step {currentStep + 1}: {demoSteps[currentStep]?.title}
              </Badge>
            )}
          </div>
          
          {isPlaying && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Current Step:</strong> {demoSteps[currentStep]?.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date Range Synchronization Component */}
      <DateRangeSync
        visualizationStartDate={visualizationStart}
        visualizationEndDate={visualizationEnd}
        weeklyActivityDate={weeklyActivityDate}
        onVisualizationDateChange={handleVisualizationDateChange}
        onWeeklyActivityDateChange={setWeeklyActivityDate}
        onSyncDates={handleSyncDates}
      />

      {/* Visualization Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Interactive Bubble Chart Visualization
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Showing mock data from {format(visualizationStart, 'MMM dd, yyyy')} to {format(visualizationEnd, 'MMM dd, yyyy')}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeVisualization} onValueChange={(value) => setActiveVisualization(value as '3d' | '2d')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="3d">3D Bubble Chart</TabsTrigger>
              <TabsTrigger value="2d">2D Bubble Chart</TabsTrigger>
            </TabsList>
            
            <TabsContent value="3d" className="mt-4">
              <BubbleChart3DFixed
                sessions={mockSessions}
                startDate={visualizationStart}
                endDate={visualizationEnd}
                onBubbleClick={handleBubbleClick}
                onError={(error) => {
                  console.error('VisualizationDemo - 3D error:', error);
                }}
              />
            </TabsContent>
            
            <TabsContent value="2d" className="mt-4">
              <Bubble2DChart
                sessions={mockSessions}
                startDate={visualizationStart}
                endDate={visualizationEnd}
                onBubbleClick={handleBubbleClick}
                onError={(error) => {
                  console.error('VisualizationDemo - 2D error:', error);
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Implementation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-800">✅ Completed Features</h4>
              <ul className="text-sm space-y-1 text-green-700">
                <li>• Mock data generator (50 sessions)</li>
                <li>• 3D bubble chart with Three.js</li>
                <li>• 2D SVG fallback chart</li>
                <li>• Interactive date range controls</li>
                <li>• Automated demo playback</li>
                <li>• View switching (2D/3D toggle)</li>
                <li>• Realistic timing and categories</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">📊 Mock Data Details</h4>
              <ul className="text-sm space-y-1 text-blue-700">
                <li>• 50 timer sessions across 10 days</li>
                <li>• 25 unique timers with varied names</li>
                <li>• 6 categories (Work, Personal, Study, etc.)</li>
                <li>• Realistic duration ranges (5min - 4hrs)</li>
                <li>• Spread across different times of day</li>
                <li>• No database dependencies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualizationDemo;
