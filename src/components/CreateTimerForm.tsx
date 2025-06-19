
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

interface CreateTimerFormProps {
  onAddTimer: (name: string) => void;
  currentTimerCount: number;
}

const CreateTimerForm = ({ onAddTimer, currentTimerCount }: CreateTimerFormProps) => {
  const { canCreateTimer, getTimerLimit, subscribed } = useSubscription();

  const handleAddTimer = () => {
    if (!canCreateTimer(currentTimerCount)) {
      const limit = getTimerLimit();
      toast.error("Timer limit reached", {
        description: `Free plan allows up to ${limit} timers. Upgrade to create unlimited timers.`
      });
      return;
    }

    onAddTimer("New Timer");
    
    // Center view after a brief delay to allow DOM update
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight / 2 - window.innerHeight / 2,
        behavior: 'smooth'
      });
    }, 100);
  };

  const isAtLimit = !canCreateTimer(currentTimerCount);
  const limit = getTimerLimit();

  return (
    <div className="fixed bottom-8 right-8">
      {!subscribed && isAtLimit && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 max-w-xs">
          <p className="font-medium">Free plan limit reached</p>
          <p>You've created {limit} timers. Upgrade for unlimited timers.</p>
        </div>
      )}
      
      <Button
        onClick={handleAddTimer}
        className={`h-16 w-16 rounded-full shadow-lg transition-all duration-300 shadow-accent/20 ${
          isAtLimit 
            ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed" 
            : "bg-accent hover:bg-accent/90"
        }`}
        size="icon"
        disabled={isAtLimit}
      >
        <Plus size={30} className={isAtLimit ? "text-gray-200" : "text-accent-foreground"} />
      </Button>
    </div>
  );
};

export default CreateTimerForm;
