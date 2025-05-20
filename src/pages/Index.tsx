
import { useTimers } from "../hooks/useTimers";
import Header from "../components/Header";
import TimerList from "../components/TimerList";
import CreateTimerForm from "../components/CreateTimerForm";
import TimeCharts from "../components/TimeCharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { timers, addTimer, toggleTimer, resetTimer, deleteTimer, renameTimer } = useTimers();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 pb-12 max-w-4xl">
        <Tabs defaultValue="timers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="timers">Timers</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timers" className="space-y-4">
            <CreateTimerForm onAddTimer={addTimer} />
            <TimerList
              timers={timers}
              onToggle={toggleTimer}
              onReset={resetTimer}
              onDelete={deleteTimer}
              onRename={renameTimer}
            />
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
