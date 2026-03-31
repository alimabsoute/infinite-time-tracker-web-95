
import React, { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import { useDeadSimpleTimers } from '@/hooks/useDeadSimpleTimers';
import { useTimerSessions } from '@/hooks/useTimerSessions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Clock, TrendingUp, Target, Timer as TimerIcon } from 'lucide-react';
import { formatTime } from '@/components/timer/TimerUtils';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { PDFExportButton } from '@/components/ui/pdf-export-button';
import { formatTime as calendarFormatTime } from '@/components/calendar/CalendarUtils';
import QuickInsightsDashboard from '@/components/insights/QuickInsightsDashboard';
import DateRangeVisualizationController from '@/components/calendar/visualization/DateRangeVisualizationController';
import AnalysisSection from '@/components/analytics/AnalysisSection';
import OptimizationTips from '@/components/analytics/OptimizationTips';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Analytics = () => {
  const { timers, loading } = useDeadSimpleTimers();
  const { sessions: timerSessions, loading: sessionsLoading } = useTimerSessions();

  // Separate session fetch for insights/analytics tabs (completed sessions only)
  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [completedLoading, setCompletedLoading] = useState(true);

  React.useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from('timer_sessions')
          .select(`
            *,
            timers!inner(
              id,
              name,
              category
            )
          `)
          .not('end_time', 'is', null)
          .order('start_time', { ascending: false });

        if (error) throw error;
        setCompletedSessions(data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setCompletedSessions([]);
      } finally {
        setCompletedLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const [timeRange, setTimeRange] = useState('7');
  const [selectedTimer, setSelectedTimer] = useState<string>('all');

  // Filter data based on time range
  const dateRange = useMemo(() => {
    const days = parseInt(timeRange);
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(new Date(), days - 1));
    return { start, end };
  }, [timeRange]);

  const filteredSessions = useMemo(() => {
    if (!completedSessions) return [];

    return completedSessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      const inRange = isWithinInterval(sessionDate, dateRange);
      const matchesTimer = selectedTimer === 'all' || session.timer_id === selectedTimer;
      return inRange && matchesTimer && session.end_time;
    });
  }, [completedSessions, dateRange, selectedTimer]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalTime = filteredSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
    const totalSessions = filteredSessions.length;
    const averageSession = totalSessions > 0 ? totalTime / totalSessions : 0;

    // Daily breakdown
    const dailyData = [];
    for (let i = parseInt(timeRange) - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const daySessions = filteredSessions.filter(session =>
        isWithinInterval(new Date(session.start_time), { start: dayStart, end: dayEnd })
      );

      const dayTime = daySessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);

      dailyData.push({
        date: format(date, 'MMM dd'),
        time: Math.round(dayTime / (1000 * 60)),
        sessions: daySessions.length
      });
    }

    // Timer breakdown
    const timerStats = timers.map(timer => {
      const timerSessionsFiltered = filteredSessions.filter(session => session.timer_id === timer.id);
      const timerTime = timerSessionsFiltered.reduce((sum, session) => sum + (session.duration_ms || 0), 0);

      return {
        id: timer.id,
        name: timer.name,
        category: timer.category,
        time: timerTime,
        sessions: timerSessionsFiltered.length,
        percentage: totalTime > 0 ? (timerTime / totalTime) * 100 : 0
      };
    }).filter(stat => stat.time > 0).sort((a, b) => b.time - a.time);

    // Category breakdown
    const categoryStats = timerStats.reduce((acc, timer) => {
      const category = timer.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { name: category, time: 0, sessions: 0 };
      }
      acc[category].time += timer.time;
      acc[category].sessions += timer.sessions;
      return acc;
    }, {} as Record<string, { name: string; time: number; sessions: number }>);

    const categoryData = Object.values(categoryStats).map(cat => ({
      ...cat,
      percentage: totalTime > 0 ? (cat.time / totalTime) * 100 : 0
    }));

    return {
      totalTime,
      totalSessions,
      averageSession,
      dailyData,
      timerStats,
      categoryData
    };
  }, [filteredSessions, timers, timeRange]);

  if (loading || completedLoading || sessionsLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Analytics"
      description="Deep insights into your time tracking patterns and productivity"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <PDFExportButton
          elementId="analytics-content"
          fileName="analytics-export"
          className="ml-auto"
        />
      </div>

      <div id="analytics-content">
        <Tabs defaultValue="insights" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insights">Quick Insights</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Tab 1: Quick Insights (from Insights.tsx) */}
          <TabsContent value="insights">
            <QuickInsightsDashboard timers={timers} sessions={completedSessions} />
          </TabsContent>

          {/* Tab 2: Analytics (from Analytics.tsx) */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTimer} onValueChange={setSelectedTimer}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select timer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Timers</SelectItem>
                  {timers.map(timer => (
                    <SelectItem key={timer.id} value={timer.id}>
                      {timer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTime(analytics.totalTime)}</div>
                  <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                  <TimerIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalSessions}</div>
                  <p className="text-xs text-muted-foreground">Total sessions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Session</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTime(analytics.averageSession)}</div>
                  <p className="text-xs text-muted-foreground">Per session</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatTime(analytics.totalTime / parseInt(timeRange))}
                  </div>
                  <p className="text-xs text-muted-foreground">Per day</p>
                </CardContent>
              </Card>
            </div>

            {analytics.totalSessions === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Data Available</h3>
                    <p className="text-muted-foreground">
                      Start using timers to see your analytics here
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="timers">Timers</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Activity</CardTitle>
                      <CardDescription>Time spent each day over the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.dailyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => [`${value} min`, 'Time']} />
                          <Bar dataKey="time" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Session Trend</CardTitle>
                      <CardDescription>Number of sessions per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.dailyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="sessions" stroke="#82ca9d" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timers" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Timer Performance</CardTitle>
                      <CardDescription>Breakdown by individual timers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.timerStats.slice(0, 10).map((timer) => (
                          <div key={timer.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{timer.name}</span>
                                {timer.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {timer.category}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {formatTime(timer.time)} ({timer.sessions} sessions)
                              </span>
                            </div>
                            <Progress value={timer.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                        <CardDescription>Time spent by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={analytics.categoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="time"
                            >
                              {analytics.categoryData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                        <CardDescription>Detailed breakdown by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analytics.categoryData.map((category, index) => (
                            <div key={category.name} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                  />
                                  <span className="font-medium">{category.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {formatTime(category.time)}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {category.sessions} sessions &middot; {category.percentage.toFixed(1)}% of total time
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </TabsContent>

          {/* Tab 3: Advanced (from AdvancedAnalytics.tsx) */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm">
              <h3 className="font-semibold mb-2">Data Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-muted-foreground">Total Timers</div>
                  <div className="font-medium">{timers.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Running Timers</div>
                  <div className="font-medium text-green-600">
                    {timers.filter(t => t.isRunning).length}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Sessions</div>
                  <div className="font-medium">{timerSessions.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Valid Sessions</div>
                  <div className="font-medium text-blue-600">
                    {timerSessions.filter(s => s.duration_ms && s.duration_ms > 0 && s.timers?.name).length}
                  </div>
                </div>
              </div>
            </div>

            <DateRangeVisualizationController
              filteredTimers={timers}
              sessions={timerSessions}
              formatTime={calendarFormatTime}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalysisSection sessions={timerSessions} />
              <OptimizationTips sessions={timerSessions} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Analytics;
