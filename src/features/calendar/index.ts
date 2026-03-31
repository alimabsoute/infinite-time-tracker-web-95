// Components
export { default as ActivityVisualization } from './components/ActivityVisualization';
export { default as CalendarActionButtons } from './components/CalendarActionButtons';
export { default as CalendarContent } from './components/CalendarContent';
export { default as CalendarControls } from './components/CalendarControls';
export { default as CalendarFilters } from './components/CalendarFilters';
export { default as CalendarHeader } from './components/CalendarHeader';
export { default as CalendarLayout } from './components/CalendarLayout';
export { default as CalendarMainSection } from './components/CalendarMainSection';
export { default as CalendarMainView } from './components/CalendarMainView';
export { getMonthsWithData, getWeeksWithDataInMonth, findNearestMonthWithData } from './components/CalendarNavigationUtils';
export type { MonthWithData, WeekWithData } from './components/CalendarNavigationUtils';
export { default as CalendarPageHeader } from './components/CalendarPageHeader';
export { default as CalendarSidebar } from './components/CalendarSidebar';
export { default as CalendarSidebarSection } from './components/CalendarSidebarSection';
export { default as CalendarStats } from './components/CalendarStats';
export { default as CalendarTabs } from './components/CalendarTabs';
export { default as CalendarUpcomingSection } from './components/CalendarUpcomingSection';
export {
  formatTime,
  getSessionsForDate,
  getTotalTimeForDate,
  getHeatMapColor,
  getTimersWithDeadlinesForDate,
  formatDeadlineDisplay,
  getDeadlineUrgencyLevel,
  getDeadlinePriorityColor,
  getTimersForDate,
  getAllTimersForDate,
  getSessionsForDateRange,
} from './components/CalendarUtils';
export { default as CalendarViewSelector } from './components/CalendarViewSelector';
export { default as CategoryFilter } from './components/CategoryFilter';
export { default as CategoryPerformance } from './components/CategoryPerformance';
export { default as ColorLegend } from './components/ColorLegend';
export { renderDay } from './components/CustomDayRenderer';
export { default as DailyDetailsPanel } from './components/DailyDetailsPanel';
export { default as DataAwareCalendarNavigation } from './components/DataAwareCalendarNavigation';
export { default as DateRangePicker } from './components/DateRangePicker';
export { default as DateRangeSelector } from './components/DateRangeSelector';
export { default as DayView } from './components/DayView';
export { default as DayViewFilters } from './components/DayViewFilters';
export { default as DayViewHeader } from './components/DayViewHeader';
export { default as DayViewSummary } from './components/DayViewSummary';
export { default as DeadlinesList } from './components/DeadlinesList';
export { default as DetailedDeadlinesModal } from './components/DetailedDeadlinesModal';
export { default as FilterPanel } from './components/FilterPanel';
export { default as FocusAnalytics } from './components/FocusAnalytics';
export { default as HorizontalTimerDisplay } from './components/HorizontalTimerDisplay';
export { default as MonthlySummaryCard } from './components/MonthlySummaryCard';
export { default as ProductivityCalendarGrid } from './components/ProductivityCalendarGrid';
export { default as ProductivityHeatmap } from './components/ProductivityHeatmap';
export { default as ProductivityInsights } from './components/ProductivityInsights';
export { default as QuickStatsDashboard } from './components/QuickStatsDashboard';
export { default as QuickStatsItem } from './components/QuickStatsItem';
export { default as SessionDataValidator } from './components/SessionDataValidator';
export { default as SmartWeekNavigation } from './components/SmartWeekNavigation';
export { default as TimeHeatmap } from './components/TimeHeatmap';
export { default as TimerAnalyticsList } from './components/TimerAnalyticsList';
export { default as TimerBubbleChart2D } from './components/TimerBubbleChart2D';
export { default as TimerBubbleChart3D } from './components/TimerBubbleChart3D';
export { default as TimerCategoryFilter } from './components/TimerCategoryFilter';
export { default as TimerChartLegend } from './components/TimerChartLegend';
export { default as TimerDetails } from './components/TimerDetails';
export { default as TimersList } from './components/TimersList';
export { default as TrendAnalysis } from './components/TrendAnalysis';
export { default as UpcomingDeadlines } from './components/UpcomingDeadlines';
export { default as UrgentDeadlinesBanner } from './components/UrgentDeadlinesBanner';
export { default as WeekDataSummary } from './components/WeekDataSummary';
export { default as WeeklyAnalysis } from './components/WeeklyAnalysis';
export { default as WeeklyChart } from './components/WeeklyChart';
export { WeeklyChartTooltip, getChartConfig } from './components/WeeklyChartConfig';
export type { WeeklyChartTooltipProps } from './components/WeeklyChartConfig';
export { default as WeeklyNavigation } from './components/WeeklyNavigation';
export { default as WeeklyStats } from './components/WeeklyStats';
export { default as WeekView } from './components/WeekView';
export { default as YearView } from './components/YearView';

// Visualization
export { default as ActivitySummaryStats } from './visualization/ActivitySummaryStats';
export { default as AnimatedBubble } from './visualization/AnimatedBubble';
export { default as AxisSystem } from './visualization/AxisSystem';
export { default as BubbleAnimations } from './visualization/BubbleAnimations';
export { BubbleChart } from './visualization/BubbleChart';
export { default as BubbleChartLegend } from './visualization/BubbleChartLegend';
export { useBubbleDataProcessor, processBubbleData } from './visualization/BubbleDataProcessor';
export type { BubbleDataPoint, BubbleData } from './visualization/BubbleDataProcessor';
export { BubbleLegend } from './visualization/BubbleLegend';
export { useBubbleMetrics } from './visualization/BubbleMetrics';
export type { BubbleMetric } from './visualization/BubbleMetrics';
export { default as BubbleScene3D } from './visualization/BubbleScene3D';
export { BubbleTooltip } from './visualization/BubbleTooltip';
export { default as CategoryRadarChart } from './visualization/CategoryRadarChart';
export { default as ChartControls } from './visualization/ChartControls';
export { default as ChartInsights } from './visualization/ChartInsights';
export { CustomBubbleDot } from './visualization/CustomBubbleDot';
export { default as DataValidator } from './visualization/DataValidator';
export type { ValidationResult } from './visualization/DataValidator';
export { useDateRangeDataProcessor } from './visualization/DateRangeDataProcessor';
export { default as DateRangeSync } from './visualization/DateRangeSync';
export { default as DateRangeVisualizationController } from './visualization/DateRangeVisualizationController';
export { default as Enhanced2DBubbleChart } from './visualization/Enhanced2DBubbleChart';
export { default as Enhanced3DAxes } from './visualization/Enhanced3DAxes';
export { default as Enhanced3DBubble } from './visualization/Enhanced3DBubble';
export { default as Enhanced3DCamera } from './visualization/Enhanced3DCamera';
export { default as EnhancedChartInsights } from './visualization/EnhancedChartInsights';
export { default as Fallback2DChart } from './visualization/Fallback2DChart';
export { default as FallbackBarChart } from './visualization/FallbackBarChart';
export { default as GeometryValidator } from './visualization/GeometryValidator';
export { default as InteractiveTimelineChart } from './visualization/InteractiveTimelineChart';
export { default as InteractiveTreemapChart } from './visualization/InteractiveTreemapChart';
export { default as NetworkInsights } from './visualization/NetworkInsights';
export { default as PerformanceHeatmap } from './visualization/PerformanceHeatmap';
export { default as RadarInsights } from './visualization/RadarInsights';
export { default as RadialProgressChart } from './visualization/RadialProgressChart';
export { default as ResizableActivityVisualization } from './visualization/ResizableActivityVisualization';
export { default as SafeText3D } from './visualization/SafeText3D';
export { default as TimelineInsights } from './visualization/TimelineInsights';
export { default as TreemapInsights } from './visualization/TreemapInsights';
export { default as TreemapNode } from './visualization/TreemapNode';
export { default as TreemapTooltip } from './visualization/TreemapTooltip';
export { default as Visualization3DErrorBoundary } from './visualization/Visualization3DErrorBoundary';
export { default as VisualizationContainer } from './visualization/VisualizationContainer';
export { default as VisualizationErrorBoundary } from './visualization/VisualizationErrorBoundary';
export { default as VisualizationHeader } from './visualization/VisualizationHeader';
export { default as VisualizationRenderer } from './visualization/VisualizationRenderer';
export { default as VisualizationSidebarContent } from './visualization/VisualizationSidebarContent';
export { default as VisualizationTabs } from './visualization/VisualizationTabs';
export { default as VisualizationTabsContent } from './visualization/VisualizationTabsContent';

// Visualization hooks
export { useDateRangeProcessor } from './visualization/hooks/useDateRangeProcessor';

// Visualization types
export type { ProcessedData } from './visualization/types/ProcessedData';

// Visualization utils
export { getCategoryColor } from './visualization/utils/ColorUtils';
export { aggregateTimerData } from './visualization/utils/DataAggregator';
export { calculateBubblePosition, calculateBubbleSize } from './visualization/utils/PositionCalculator';
export { filterSessionsInDateRange } from './visualization/utils/SessionFilter';
export { groupSessionsByTimer } from './visualization/utils/TimerGrouping';
export type { TimerGroup } from './visualization/utils/TimerGrouping';
export { processTreemapData } from './visualization/utils/TreemapDataProcessor';
export type { TreemapNodeData, TreemapData } from './visualization/utils/TreemapDataProcessor';

// Hooks
export { useTimerSessions } from './hooks/useTimerSessions';

// Utils
export { generateMockTimersForCalendar, generateMockSessionsForCalendar } from './utils/mockCalendarData';
export { generateStableMockSessionsForCalendar, clearMockDataCache } from './utils/mockCalendarDataStable';
export { mockDataGenerator } from './utils/mockDataGenerator';
export { generateMockVisualizationData } from './utils/mockVisualizationData';
