
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
        className="h-16 w-16 rounded-full shadow-2xl transition-all duration-300 bg-red-500 hover:bg-red-600 hover:scale-110 border-4 border-white"
        size="icon"
        style={{ backgroundColor: '#ef4444', zIndex: 9999 }}
      >
        <Plus size={28} className="text-white" />
      </Button>
      {/* Debug indicator */}
      <div className="absolute -top-2 -left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded">
        CREATE
      </div>
    </div>
  );
};

export default CreateTimerForm;
