
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { CalendarIcon, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface CalendarTabsProps {
  children: React.ReactNode;
  analyticsContent: React.ReactNode;
}

const CalendarTabs: React.FC<CalendarTabsProps> = ({ children, analyticsContent }) => {
  return (
    <Tabs defaultValue="calendar" className="w-full mb-6">
      <TabsList className="grid grid-cols-2 w-full mb-4">
        <TabsTrigger value="calendar">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Calendar
        </TabsTrigger>
        <TabsTrigger value="analytics">
          <Activity className="mr-2 h-4 w-4" />
          Time Analytics
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="calendar" className="mt-0">
        <motion.div
          key="calendar-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-0">
        <motion.div
          key="analytics-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {analyticsContent}
        </motion.div>
      </TabsContent>
    </Tabs>
  );
};

export default CalendarTabs;
