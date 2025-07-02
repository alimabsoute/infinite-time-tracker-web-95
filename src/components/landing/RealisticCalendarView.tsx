
import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const RealisticCalendarView = () => {
  const currentDate = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  // Sample activity data for the calendar
  const activityData = {
    5: { hours: 4.5, intensity: 'high' },
    8: { hours: 6.2, intensity: 'high' },
    12: { hours: 3.1, intensity: 'medium' },
    15: { hours: 7.8, intensity: 'high' },
    18: { hours: 2.3, intensity: 'low' },
    22: { hours: 5.4, intensity: 'high' },
    25: { hours: 4.1, intensity: 'medium' },
    28: { hours: 6.7, intensity: 'high' },
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-blue-500';
      case 'medium': return 'bg-blue-300';
      case 'low': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 shadow-2xl border border-gray-200/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <Calendar className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
          </motion.div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </motion.div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty days for start of month */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-12" />
          ))}
          
          {/* Days with activity data */}
          {days.map((day, index) => {
            const activity = activityData[day];
            const isToday = day === currentDate.getDate();
            
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (index + firstDay) * 0.02, duration: 0.3 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className={`
                  relative h-12 rounded-lg flex items-center justify-center cursor-pointer
                  transition-all duration-200
                  ${isToday 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : activity 
                      ? `${getIntensityColor(activity.intensity)} text-white shadow-md hover:shadow-lg` 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <span className="text-sm font-medium">{day}</span>
                
                {/* Activity indicator */}
                {activity && !isToday && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (index + firstDay) * 0.02 + 0.3 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                  />
                )}

                {/* Tooltip content for activity */}
                {activity && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    whileHover={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded shadow-lg whitespace-nowrap z-10"
                  >
                    {activity.hours}h logged
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Activity Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-200"
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
            <span className="text-xs text-gray-600">Low Activity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
            <span className="text-xs text-gray-600">Medium Activity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">High Activity</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating elements for extra visual interest */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + i,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
          style={{
            left: `${20 + i * 20}%`,
            top: `${30 + i * 15}%`,
          }}
        />
      ))}
    </div>
  );
};

export default RealisticCalendarView;
