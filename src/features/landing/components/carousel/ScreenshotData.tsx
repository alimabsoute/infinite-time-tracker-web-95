
import React from "react";
import { Clock, Calendar, BarChart3 } from "lucide-react";
import RealisticTimerDisplay from "../RealisticTimerDisplay";
import RealisticCalendarView from "../RealisticCalendarView";
import RealisticAnalyticsDisplay from "../RealisticAnalyticsDisplay";

export interface ScreenshotItem {
  title: string;
  description: string;
  component: React.ReactNode;
  icon: React.ReactNode;
  feature: string;
}

export const screenshots: ScreenshotItem[] = [
  {
    title: "Timer Dashboard",
    description: "Track multiple timers with customizable categories and beautiful progress indicators",
    component: <RealisticTimerDisplay />,
    icon: <Clock className="h-5 w-5 text-primary" />,
    feature: "Track multiple projects simultaneously"
  },
  {
    title: "Calendar View",
    description: "Visualize your productivity with an interactive calendar showing daily activity levels",
    component: <RealisticCalendarView />,
    icon: <Calendar className="h-5 w-5 text-primary" />,
    feature: "See your monthly productivity patterns"
  },
  {
    title: "Analytics Dashboard",
    description: "Get detailed insights into how you spend your time with advanced charts and metrics",
    component: <RealisticAnalyticsDisplay />,
    icon: <BarChart3 className="h-5 w-5 text-primary" />,
    feature: "Analyze your productivity habits"
  }
];
