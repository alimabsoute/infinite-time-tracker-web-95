
import { useState } from "react";
import { useTimers } from "../hooks/useTimers";
import Header from "../components/Header";
import TimerList from "../components/TimerList";
import CreateTimerForm from "../components/CreateTimerForm";
import TimeCharts from "../components/TimeCharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { timers, addTimer, toggleTimer, resetTimer, deleteTimer, renameTimer } = useTimers();
  const [newTimerId, setNewTimerId] = useState<string | null>(null);

  const handleAddTimer = (name: string) => {
    const id = addTimer(name);
    setNewTimerId(id);
    
    // Clear new timer ID after a delay
    setTimeout(() => {
      setNewTimerId(null);
    }, 5000); // 5 seconds should be enough time for user to name the timer
  };

  const handleRename = (id: string, newName: string) => {
    renameTimer(id, newName);
    if (id === newTimerId) {
      setNewTimerId(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteTimer(id);
    if (id === newTimerId) {
      setNewTimerId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 pb-20 max-w-5xl">
        <Tabs defaultValue="timers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="timers">Timers</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timers" className="space-y-4">
            <TimerList
              timers={timers}
              onToggle={toggleTimer}
              onReset={resetTimer}
              onDelete={handleDelete}
              onRename={handleRename}
              newTimerId={newTimerId}
            />
            <CreateTimerForm onAddTimer={handleAddTimer} />
          </TabsContent>
          
          <TabsContent value="stats">
            <TimeCharts timers={timers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
