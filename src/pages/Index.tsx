
import React, { useState, useEffect } from "react";
import { useTimers } from "../hooks/useTimers";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useNotifications } from "../hooks/useNotifications";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import TimerList from "../components/TimerList";
import CreateTimerForm from "../components/CreateTimerForm";
import ConfettiAnimation from "../components/animations/ConfettiAnimation";
import TimerLimitIndicator from "../components/premium/TimerLimitIndicator";
import NotificationPrompt from "../components/notifications/NotificationPrompt";
import { toast } from "sonner";

const Index = () => {
  const {
    timers,
    loading,
    addTimer,
    toggleTimer,
    resetTimer,
    deleteTimer,
    renameTimer,
    updateDeadline,
    updatePriority,
    reorderTimers,
    confettiTrigger,
    clearConfettiTrigger,
  } = useTimers();
  
  const { canCreateTimer, getTimerLimit, subscribed, createCheckoutSession } = useSubscription();
  const { isNotificationSupported, hasPermission, preferences } = useNotifications();
  const [newTimerId, setNewTimerId] = useState<string | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Check if we should show the notification prompt
  useEffect(() => {
    const hasTimers = timers.length > 0;
    const shouldPrompt = isNotificationSupported && 
                        !hasPermission && 
                        preferences.enabled && 
                        hasTimers &&
                        !localStorage.getItem('notification-prompt-dismissed');
    
    setShowNotificationPrompt(shouldPrompt);
  }, [isNotificationSupported, hasPermission, preferences.enabled, timers.length]);

  const handleDismissNotificationPrompt = () => {
    setShowNotificationPrompt(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  const handleAddTimer = async (name: string) => {
    // Double-check the limit before creating
    if (!canCreateTimer(timers.length)) {
      const limit = getTimerLimit();
      toast.error("Timer limit reached", {
        description: `Free plan allows up to ${limit} timers. Upgrade to create unlimited timers.`
      });
      return;
    }

    const id = await addTimer(name);
    if (id) {
      setNewTimerId(id);
      setTimeout(() => setNewTimerId(null), 3000);
    }
  };

  const handleUpgrade = async () => {
    const url = await createCheckoutSession();
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Notification Prompt */}
        {showNotificationPrompt && (
          <div className="mb-6">
            <NotificationPrompt onDismiss={handleDismissNotificationPrompt} />
          </div>
        )}

        {/* Premium Timer Limit Indicator */}
        {!subscribed && (
          <div className="mb-6">
            <TimerLimitIndicator currentCount={timers.length} />
          </div>
        )}

        {/* Subscription Status Banner */}
        {!subscribed && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-blue-900">Free Plan</h3>
                <p className="text-sm text-blue-700">
                  {timers.length}/{getTimerLimit()} timers used. Upgrade for unlimited timers and premium features.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={handleUpgrade}
              >
                Upgrade
              </Button>
            </div>
          </div>
        )}

        <TimerList
          timers={timers}
          onToggle={toggleTimer}
          onReset={resetTimer}
          onDelete={deleteTimer}
          onRename={renameTimer}
          onUpdateDeadline={updateDeadline}
          onUpdatePriority={updatePriority}
          onReorder={reorderTimers}
          newTimerId={newTimerId}
          onCreateTimer={() => handleAddTimer("New Timer")}
        />
        <CreateTimerForm 
          onAddTimer={handleAddTimer} 
          currentTimerCount={timers.length}
        />
        
        {/* Confetti Animation */}
        {confettiTrigger && (
          <ConfettiAnimation
            x={confettiTrigger.x}
            y={confettiTrigger.y}
            onComplete={clearConfettiTrigger}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
