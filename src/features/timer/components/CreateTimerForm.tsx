
import { Plus } from "lucide-react";

interface CreateTimerFormProps {
  onAddTimer: (name: string, position?: { x: number; y: number }) => void;
  currentTimerCount: number;
}

const CreateTimerForm = ({ onAddTimer }: CreateTimerFormProps) => {
  
  const handleAddTimer = (event: React.MouseEvent) => {
    
    // Capture click position for animations
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    onAddTimer("New Timer", position);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50" key={`create-timer-${Date.now()}`}>
      <div
        onClick={handleAddTimer}
        role="button"
        tabIndex={0}
        aria-label="Create new timer"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleAddTimer(e as any);
          }
        }}
        className="h-16 w-16 bg-blue-500 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 flex items-center justify-center"
        style={{ zIndex: 9999 }}
      >
        <Plus 
          size={28} 
          className="text-white" 
        />
      </div>
    </div>
  );
};

export default CreateTimerForm;
