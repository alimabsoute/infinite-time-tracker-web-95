
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Activity } from "lucide-react";
import { AnimatePresence } from "framer-motion";

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
      
      <AnimatePresence mode="wait">
        <TabsContent value="calendar" className="mt-0">
          {children}
        </TabsContent>
        
        <TabsContent value="analytics">
          {analyticsContent}
        </TabsContent>
      </AnimatePresence>
    </Tabs>
  );
};

export default CalendarTabs;
