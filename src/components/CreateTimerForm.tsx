
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateTimerFormProps {
  onAddTimer: (name: string) => void;
}

const CreateTimerForm = ({ onAddTimer }: CreateTimerFormProps) => {
  const handleAddTimer = () => {
    onAddTimer("New Timer");
    
    // Center view after a brief delay to allow DOM update
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight / 2 - window.innerHeight / 2,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <Button
      onClick={handleAddTimer}
      className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg bg-accent hover:bg-accent/90 transition-all duration-300 shadow-accent/20"
      size="icon"
    >
      <Plus size={30} className="text-accent-foreground" />
    </Button>
  );
};

export default CreateTimerForm;
