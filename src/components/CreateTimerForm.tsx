
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateTimerFormProps {
  onAddTimer: (name: string) => void;
}

const CreateTimerForm = ({ onAddTimer }: CreateTimerFormProps) => {
  const handleAddTimer = () => {
    onAddTimer("New Timer");
  };

  return (
    <Button
      onClick={handleAddTimer}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
      size="icon"
    >
      <Plus size={24} />
    </Button>
  );
};

export default CreateTimerForm;
