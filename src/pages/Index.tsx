
import React, { useState, useEffect } from "react";
import { useTimers } from "../hooks/useTimers";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useNotifications } from "../hooks/useNotifications";
import { useClearMockData } from "../hooks/useClearMockData";
import { Button } from "@/components/ui/button";
import PageLayout from "../components/layout/PageLayout";
import TimerList from "../components/TimerList";
import CreateTimerForm from "../components/CreateTimerForm";
import ConfettiAnimation from "../components/animations/ConfettiAnimation";
import NotificationPromptSection from "../components/dashboard/NotificationPromptSection";
import SubscriptionBanner from "../components/dashboard/SubscriptionBanner";
import ClearDataControls from "../components/dashboard/ClearDataControls";
import { getTimerDashboardStats } from "../components/dashboard/TimerDashboardStats";
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
  const { clearMockTimers, forceClearAllTimers, isClearing } = useClearMockData();
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
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  const dashboardStats = getTimerDashboardStats(timers);

  return (
    <PageLayout 
      title={dashboardStats.title}
      description={dashboardStats.description}
    >
      {/* Notification Prompt */}
      <NotificationPromptSection 
        showNotificationPrompt={showNotificationPrompt}
        onDismissNotificationPrompt={handleDismissNotificationPrompt}
      />

      {/* Subscription Banner (for free users) */}
      <SubscriptionBanner 
        subscribed={subscribed}
        timersCount={timers.length}
        getTimerLimit={getTimerLimit}
        onUpgrade={handleUpgrade}
      />

      {/* Clear Data Controls */}
      <ClearDataControls 
        subscribed={subscribed}
        isClearing={isClearing}
        onClearMockTimers={clearMockTimers}
        onForceClearAllTimers={forceClearAllTimers}
      />

      <div className="space-y-8">
        <CreateTimerForm 
          onAddTimer={handleAddTimer} 
          currentTimerCount={timers.length}
        />
        
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
      </div>
      
      {/* Confetti Animation */}
      {confettiTrigger && (
        <ConfettiAnimation
          x={confettiTrigger.x}
          y={confettiTrigger.y}
          onComplete={clearConfettiTrigger}
        />
      )}
    </PageLayout>
  );
};

export default Index;
