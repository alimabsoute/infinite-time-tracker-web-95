import React, { useMemo } from "react";
import { Timer } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import EmptyState from "./EmptyState";

interface TimeChartsProps {
  timers: Timer[];
}

const TimeCharts: React.FC<TimeChartsProps> = ({ timers }) => {
  // Prepare data for daily activity chart
  const dailyActivity = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i));

    return last7Days.map(date => {
      const start = startOfDay(date);
      const end = endOfDay(date);

      const totalTime = timers.reduce((acc, timer) => {
        if (isWithinInterval(new Date(timer.createdAt), { start, end })) {
          return acc + timer.elapsedTime;
        }
        return acc;
      }, 0);

      return {
        date: format(date, "EEE"),
        time: totalTime / 60000, // Convert to minutes
      };
    }).reverse();
  }, [timers]);

  // Prepare data for category distribution chart
  const categoryDistribution = useMemo(() => {
    const categoryTimes: { [key: string]: number } = {};

    timers.forEach(timer => {
      const category = timer.category || "Uncategorized";
      categoryTimes[category] = (categoryTimes[category] || 0) + timer.elapsedTime;
    });

    const data = Object.entries(categoryTimes).map(([category, time]) => ({
      name: category,
      value: time,
    }));

    // Ensure there's always at least one data point
    if (data.length === 0) {
      return [{ name: "No Data", value: 1 }];
    }

    return data;
  }, [timers]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#a45de2"];

  // Prepare data for productivity trend line chart
  const productivityTrend = useMemo(() => {
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => subDays(today, i));

    return last30Days.map(date => {
      const start = startOfDay(date);
      const end = endOfDay(date);

      const totalTime = timers.reduce((acc, timer) => {
        if (isWithinInterval(new Date(timer.createdAt), { start, end })) {
          return acc + timer.elapsedTime;
        }
        return acc;
      }, 0);

      return {
        date: format(date, "MMM dd"),
        time: totalTime / 60000, // Convert to minutes
      };
    }).reverse();
  }, [timers]);

  if (timers.length === 0) {
    return (
      <EmptyState 
        type="analytics" 
        showCreateButton={false}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(0)} mins`} />
              <Bar dataKey="time" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                dataKey="value"
                isAnimationActive={false}
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${(value / 60000).toFixed(0)} mins`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Productivity Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productivityTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(0)} mins`} />
              <Line type="monotone" dataKey="time" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeCharts;
