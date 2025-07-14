
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateTimerFormProps {
  onAddTimer: (name: string) => void;
  currentTimerCount: number;
}

const CreateTimerForm = ({ onAddTimer, currentTimerCount }: CreateTimerFormProps) => {
  console.log('🎨 CreateTimerForm - Rendering with timer count:', currentTimerCount);
  
  const handleAddTimer = () => {
    console.log('➕ CreateTimerForm - Add button clicked');
    onAddTimer("New Timer");
  };

  return (
    <div className="fixed bottom-8 right-8 z-50" key={`create-timer-${Date.now()}`}>
      <Button
        onClick={handleAddTimer}
        className="relative h-16 w-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border-4 border-white/20 backdrop-blur-sm overflow-hidden group"
        size="icon"
        style={{ zIndex: 9999 }}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/60 via-red-500/70 to-purple-600/60 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tr from-red-400/40 via-purple-400/50 to-red-500/40 animate-[pulse_2s_ease-in-out_infinite_reverse]" />
        
        {/* Plus icon */}
        <Plus size={28} className="relative z-10 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-200" />
        
        {/* Outer glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-red-500/30 blur-xl animate-pulse" />
      </Button>
    </div>
  );
};

export default CreateTimerForm;
