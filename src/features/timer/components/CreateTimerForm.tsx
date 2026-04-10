
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
    <div className="fixed bottom-8 right-8 z-50">
      <div
        onClick={handleAddTimer}
        role="button"
        tabIndex={0}
        aria-label="Create new timer"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleAddTimer(e as unknown as React.MouseEvent);
          }
        }}
        className="h-14 w-14 bg-primary rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 flex items-center justify-center shadow-lg"
      >
        <Plus size={26} className="text-primary-foreground" />
      </div>
    </div>
  );
};

export default CreateTimerForm;
