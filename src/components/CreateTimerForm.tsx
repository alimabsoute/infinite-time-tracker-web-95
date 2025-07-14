
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
        className="relative h-16 w-16 rounded-full cursor-pointer transition-all duration-500 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/30 group"
        style={{ 
          zIndex: 9999,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: `
            0 8px 32px 0 rgba(31, 38, 135, 0.37),
            inset 0 1px 0 0 rgba(255,255,255,0.5),
            inset 0 -1px 0 0 rgba(255,255,255,0.1),
            0 0 0 1px rgba(255,255,255,0.05)
          `
        }}
      >
        {/* Inner glass layer */}
        <div 
          className="absolute inset-0.5 rounded-full transition-all duration-500 group-hover:bg-white/5"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
            backdropFilter: 'blur(5px)'
          }}
        />
        
        {/* 3D depth effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, transparent, rgba(0,0,0,0.1))',
            transform: 'translateZ(0)'
          }}
        />
        
        {/* Plus icon */}
        <Plus 
          size={28} 
          className="relative z-10 text-white/90 group-hover:text-white group-hover:scale-110 transition-all duration-300 drop-shadow-lg" 
        />
        
        {/* Outer glow */}
        <div 
          className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)',
            filter: 'blur(8px)'
          }}
        />
      </div>
    </div>
  );
};

export default CreateTimerForm;
