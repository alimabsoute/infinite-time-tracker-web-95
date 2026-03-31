
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface NotificationPreferences {
  enabled: boolean;
  completionNotifications: boolean;
  milestoneNotifications: boolean;
  milestoneInterval: number; // in minutes
}

interface TimerNotificationData {
  timerId: string;
  timerName: string;
  elapsedTime: number;
  lastMilestoneTime: number;
}

export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    completionNotifications: true,
    milestoneNotifications: true,
    milestoneInterval: 60, // 60 minutes default
  });
  const [_timerNotificationData, setTimerNotificationData] = useState<Map<string, TimerNotificationData>>(new Map());

  // Check if notifications are supported
  const isNotificationSupported = 'Notification' in window;

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('notification-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse notification preferences:', error);
      }
    }

    // Check current permission status
    if (isNotificationSupported) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, [isNotificationSupported]);

  // Save preferences to localStorage
  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    localStorage.setItem('notification-preferences', JSON.stringify(updated));
  }, [preferences]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isNotificationSupported) {
      toast.error('Notifications not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      setHasPermission(true);
      return true;
    }

    if (Notification.permission === 'denied') {
      toast.error('Notifications blocked. Please enable them in your browser settings.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      
      if (granted) {
        toast.success('Notifications enabled! You\'ll be notified when timers complete.');
      } else {
        toast.error('Notifications denied. You can enable them later in browser settings.');
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, [isNotificationSupported]);

  // Send a notification
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isNotificationSupported || !hasPermission || !preferences.enabled) {
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }, [isNotificationSupported, hasPermission, preferences.enabled]);

  // Send timer completion notification
  const notifyTimerCompletion = useCallback((timerName: string, totalTime: number) => {
    if (!preferences.completionNotifications) return;

    const hours = Math.floor(totalTime / (1000 * 60 * 60));
    const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalTime % (1000 * 60)) / 1000);

    let timeString = '';
    if (hours > 0) {
      timeString = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      timeString = `${minutes}m ${seconds}s`;
    } else {
      timeString = `${seconds}s`;
    }

    sendNotification(`Timer "${timerName}" completed!`, {
      body: `Total time: ${timeString}`,
      tag: `timer-completion-${timerName}`,
    });
  }, [preferences.completionNotifications, sendNotification]);

  // Send milestone notification
  const notifyMilestone = useCallback((timerName: string, milestoneMinutes: number) => {
    if (!preferences.milestoneNotifications) return;

    const hours = Math.floor(milestoneMinutes / 60);
    const minutes = milestoneMinutes % 60;

    let timeString = '';
    if (hours > 0) {
      timeString = `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    } else {
      timeString = `${minutes}m`;
    }

    sendNotification(`${timeString} milestone reached!`, {
      body: `Timer "${timerName}" has been running for ${timeString}`,
      tag: `timer-milestone-${timerName}`,
    });
  }, [preferences.milestoneNotifications, sendNotification]);

  // Update timer notification data and check for milestones
  const updateTimerData = useCallback((timerId: string, timerName: string, elapsedTime: number, isRunning: boolean) => {
    if (!isRunning) {
      // Remove timer data when stopped
      setTimerNotificationData(prev => {
        const updated = new Map(prev);
        updated.delete(timerId);
        return updated;
      });
      return;
    }

    setTimerNotificationData(prev => {
      const updated = new Map(prev);
      const existing = updated.get(timerId);
      
      const milestoneIntervalMs = preferences.milestoneInterval * 60 * 1000;
      const currentMilestone = Math.floor(elapsedTime / milestoneIntervalMs);
      
      if (!existing) {
        // First time tracking this timer
        updated.set(timerId, {
          timerId,
          timerName,
          elapsedTime,
          lastMilestoneTime: currentMilestone,
        });
      } else {
        // Check if we've reached a new milestone
        const lastMilestone = existing.lastMilestoneTime;
        
        if (currentMilestone > lastMilestone && currentMilestone > 0) {
          // Send milestone notification
          const milestoneMinutes = currentMilestone * preferences.milestoneInterval;
          notifyMilestone(timerName, milestoneMinutes);
        }
        
        // Update the data
        updated.set(timerId, {
          ...existing,
          timerName,
          elapsedTime,
          lastMilestoneTime: currentMilestone,
        });
      }
      
      return updated;
    });
  }, [preferences.milestoneInterval, notifyMilestone]);

  return {
    isNotificationSupported,
    hasPermission,
    preferences,
    updatePreferences,
    requestPermission,
    sendNotification,
    notifyTimerCompletion,
    updateTimerData,
  };
};
