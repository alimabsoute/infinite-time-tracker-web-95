
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Target, Calendar } from "lucide-react";

const RealisticAnalyticsDisplay = () => {
  // Sample data for charts
  const weeklyData = [
    { day: 'Mon', hours: 6.5 },
    { day: 'Tue', hours: 8.2 },
    { day: 'Wed', hours: 7.1 },
    { day: 'Thu', hours: 9.3 },
    { day: 'Fri', hours: 5.8 },
    { day: 'Sat', hours: 3.2 },
    { day: 'Sun', hours: 4.1 }
  ];

  const categoryData = [
    { name: 'Development', value: 45, color: '#3b82f6' },
    { name: 'Meetings', value: 25, color: '#8b5cf6' },
    { name: 'Planning', value: 20, color: '#10b981' },
    { name: 'Learning', value: 10, color: '#f59e0b' }
  ];

  const productivityData = [
    { week: 'W1', score: 72 },
    { week: 'W2', score: 78 },
    { week: 'W3', score: 85 },
    { week: 'W4', score: 91 }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-2xl border border-gray-200/50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* Header Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { title: "Total Time", value: "44.2h", icon: Clock, color: "text-blue-500" },
            { title: "Productivity", value: "91%", icon: TrendingUp, color: "text-green-500" },
            { title: "Sessions", value: "28", icon: Target, color: "text-purple-500" },
            { title: "Streak", value: "12d", icon: Calendar, color: "text-orange-500" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Weekly Hours Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Weekly Hours</h4>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Time by Category</h4>
            <div className="flex items-center space-x-4">
              <ResponsiveContainer width="60%" height={120}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs text-gray-600">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">{category.value}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Productivity Trend */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 col-span-2"
          >
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Productivity Trend</h4>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Insights Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200"
          >
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Peak Performance</span>
            </div>
            <p className="text-xs text-green-700">Thursday 2-4 PM is your most productive time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Focus Streak</span>
            </div>
            <p className="text-xs text-blue-700">12-day streak of meeting daily goals</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating particles */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-20"
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
            opacity: [0, 0.4, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 6 + i * 0.5,
            delay: i * 0.8,
            ease: "easeInOut"
          }}
          style={{
            left: `${20 + i * 20}%`,
            top: `${30 + (i % 2) * 40}%`,
          }}
        />
      ))}
    </div>
  );
};

export default RealisticAnalyticsDisplay;
