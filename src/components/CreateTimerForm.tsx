
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
        className="relative h-16 w-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border-4 border-white/10 backdrop-blur-sm overflow-hidden group !bg-transparent"
        size="icon"
        style={{ 
          zIndex: 9999,
          background: 'transparent'
        }}
      >
        {/* Multi-color flowing gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-300/20 via-purple-300/25 via-blue-300/20 via-cyan-300/25 via-teal-300/20 via-emerald-300/25 via-lime-300/20 via-yellow-300/25 via-orange-300/20 via-red-300/25 to-pink-300/20 animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/15 via-indigo-200/20 via-purple-200/15 via-fuchsia-200/20 via-rose-200/15 via-orange-200/20 via-amber-200/15 via-lime-200/20 via-green-200/15 via-teal-200/20 to-blue-200/15 animate-[pulse_12s_ease-in-out_infinite_reverse]" />
        <div className="absolute inset-0 bg-gradient-to-bl from-violet-200/10 via-sky-200/15 via-emerald-200/10 via-yellow-200/15 via-rose-200/10 via-cyan-200/15 to-violet-200/10 animate-[pulse_10s_ease-in-out_infinite]" />
        
        {/* Plus icon */}
        <Plus size={28} className="relative z-10 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-200" />
        
        {/* Outer flowing glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/10 via-pink-400/15 via-blue-400/10 to-cyan-400/15 blur-xl animate-[pulse_15s_ease-in-out_infinite]" />
        
        {/* Debug indicator to verify it's rendering */}
        <div className="absolute -top-8 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded opacity-50">
          BUTTON
        </div>
      </Button>
    </div>
  );
};

export default CreateTimerForm;
