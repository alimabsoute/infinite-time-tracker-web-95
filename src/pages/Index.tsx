
import { useState } from "react";
import { useTimers } from "../hooks/useTimers";
import Header from "../components/Header";
import TimerList from "../components/TimerList";
import CreateTimerForm from "../components/CreateTimerForm";
import TimeCharts from "../components/TimeCharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Timer as TimerIcon, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { 
    timers, 
    addTimer, 
    toggleTimer, 
    resetTimer, 
    deleteTimer, 
    renameTimer,
    updateDeadline,
    updatePriority,
    reorderTimers
  } = useTimers();
  const [newTimerId, setNewTimerId] = useState<string | null>(null);

  const handleAddTimer = (name: string) => {
    const id = addTimer(name);
    setNewTimerId(id);
    
    // Clear new timer ID after a delay
    setTimeout(() => {
      setNewTimerId(null);
    }, 5000); // 5 seconds should be enough time for user to name the timer
  };

  const handleRename = (id: string, newName: string, category?: string) => {
    renameTimer(id, newName, category);
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

  const handleUpdateDeadline = (id: string, deadline: Date | undefined) => {
    updateDeadline(id, deadline);
    
    // Show toast notification when setting a deadline
    if (deadline) {
      toast("Deadline set", {
        description: `Deadline set for ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}`,
      });
    }
  };

  const handleUpdatePriority = (id: string, priority: number | undefined) => {
    updatePriority(id, priority);
    
    if (priority !== undefined) {
      toast(`Priority set to ${priority}`, {
        description: priority === 1 ? "Highest priority" : priority === 5 ? "Lowest priority" : "",
      });
    }
  };

  const handleReorderTimers = (reorderedTimers: any[]) => {
    reorderTimers(reorderedTimers);
  };

  // Calculate quick stats for the header
  const activeTimers = timers.filter(timer => timer.isRunning).length;
  const totalTimers = timers.length;
  
  // Calculate total time tracked today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTracked = timers.reduce((total, timer) => {
    const timerDate = new Date(timer.createdAt);
    if (timerDate >= today || timer.isRunning) {
      return total + timer.elapsedTime;
    }
    return total;
  }, 0);
  
  // Format time for display
  const formatTimeForHeader = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Check for deadline notifications on component mount
  useState(() => {
    const now = new Date();
    
    // Find timers with passed deadlines
    const overdueTimers = timers.filter(
      timer => timer.deadline && timer.deadline < now
    );
    
    // Show toast for overdue timers
    overdueTimers.forEach(timer => {
      toast.warning(`"${timer.name}" is overdue!`, {
        description: `The deadline was ${timer.deadline?.toLocaleDateString()} at ${timer.deadline?.toLocaleTimeString()}`
      });
    });
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 pb-20 max-w-5xl">
        {/* New header stats section */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-indigo-900/10 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-full">
                <TimerIcon size={20} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Timers</p>
                <p className="text-xl font-semibold">{activeTimers} / {totalTimers}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-emerald-900/10 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-full">
                <Calendar size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-xl font-semibold">{formatTimeForHeader(todayTracked)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-900/10 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-full">
                <TrendingUp size={20} className="text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-xl font-semibold">
                  {new Set(timers.map(t => t.category)).size}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="timers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="timers" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-muted-foreground">
              Timers
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-muted-foreground">
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="timers" className="space-y-4">
            <div className="glass-effect rounded-lg p-4">
              <TimerList
                timers={timers}
                onToggle={toggleTimer}
                onReset={resetTimer}
                onDelete={handleDelete}
                onRename={handleRename}
                onUpdateDeadline={handleUpdateDeadline}
                onUpdatePriority={handleUpdatePriority}
                onReorder={handleReorderTimers}
                newTimerId={newTimerId}
              />
            </div>
            <CreateTimerForm onAddTimer={handleAddTimer} />
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="glass-effect rounded-lg p-4">
              <TimeCharts timers={timers} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
