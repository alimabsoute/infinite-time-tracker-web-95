
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
      <div
        onClick={handleAddTimer}
        role="button"
        tabIndex={0}
        aria-label="Create new timer"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleAddTimer();
          }
        }}
        className="relative h-16 w-16 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/20 overflow-hidden group animate-pulse-glow"
        style={{ 
          zIndex: 9999,
          background: `conic-gradient(
            from 0deg,
            hsl(330, 70%, 60%) 0%,
            hsl(300, 70%, 60%) 12.5%,
            hsl(270, 70%, 60%) 25%,
            hsl(240, 70%, 60%) 37.5%,
            hsl(210, 70%, 60%) 50%,
            hsl(180, 70%, 60%) 62.5%,
            hsl(150, 70%, 60%) 75%,
            hsl(120, 70%, 60%) 87.5%,
            hsl(330, 70%, 60%) 100%
          )`,
          boxShadow: `
            0 0 30px rgba(255, 255, 255, 0.1),
            0 0 60px rgba(255, 255, 255, 0.05),
            inset 0 0 0 2px rgba(255, 255, 255, 0.1)
          `
        }}
      >
        {/* Inner content area with slight transparency */}
        <div className="absolute inset-1 rounded-full bg-black/5 backdrop-blur-sm flex items-center justify-center">
          <Plus 
            size={28} 
            className="text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-200 relative z-10" 
          />
        </div>
        
        {/* Outer glow effect */}
        <div 
          className="absolute -inset-2 rounded-full opacity-30 blur-lg"
          style={{
            background: `conic-gradient(
              from 0deg,
              hsl(330, 70%, 60%) 0%,
              hsl(300, 70%, 60%) 12.5%,
              hsl(270, 70%, 60%) 25%,
              hsl(240, 70%, 60%) 37.5%,
              hsl(210, 70%, 60%) 50%,
              hsl(180, 70%, 60%) 62.5%,
              hsl(150, 70%, 60%) 75%,
              hsl(120, 70%, 60%) 87.5%,
              hsl(330, 70%, 60%) 100%
            )`,
            animation: 'spin 8s linear infinite reverse'
          }}
        />
      </div>
    </div>
  );
};

export default CreateTimerForm;
