
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateTimerFormProps {
  onAddTimer: (name: string) => void;
  currentTimerCount: number;
}

const CreateTimerForm = ({ onAddTimer }: CreateTimerFormProps) => {
  const handleAddTimer = () => {
    onAddTimer("New Timer");
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Button
        onClick={handleAddTimer}
        className="h-14 w-14 rounded-full shadow-lg transition-all duration-300 bg-primary hover:bg-primary/90 hover:scale-110"
        size="icon"
      >
        <Plus size={24} className="text-primary-foreground" />
      </Button>
    </div>
  );
};

export default CreateTimerForm;
