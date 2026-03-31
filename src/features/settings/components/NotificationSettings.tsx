
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Switch } from '@shared/components/ui/switch';
import { Label } from '@shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Button } from '@shared/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useNotifications } from '@shared/hooks/useNotifications';

const NotificationSettings: React.FC = () => {
  const {
    isNotificationSupported,
    hasPermission,
    preferences,
    updatePreferences,
    requestPermission,
  } = useNotifications();

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    
    updatePreferences({ enabled });
  };

  const handleMilestoneIntervalChange = (value: string) => {
    updatePreferences({ milestoneInterval: parseInt(value) });
  };

  if (!isNotificationSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Unavailable
          </CardTitle>
          <CardDescription>
            Desktop notifications are not supported in this browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure when and how you receive notifications for your timers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main notification toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive desktop notifications for timer events
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!hasPermission && preferences.enabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestPermission}
                className="text-xs"
              >
                Grant Permission
              </Button>
            )}
            <Switch
              id="notifications-enabled"
              checked={preferences.enabled && hasPermission}
              onCheckedChange={handleToggleNotifications}
            />
          </div>
        </div>

        {preferences.enabled && hasPermission && (
          <>
            {/* Completion notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="completion-notifications">Completion Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you stop a timer
                </p>
              </div>
              <Switch
                id="completion-notifications"
                checked={preferences.completionNotifications}
                onCheckedChange={(checked) => 
                  updatePreferences({ completionNotifications: checked })
                }
              />
            </div>

            {/* Milestone notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="milestone-notifications">Milestone Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified at regular intervals while timers run
                </p>
              </div>
              <Switch
                id="milestone-notifications"
                checked={preferences.milestoneNotifications}
                onCheckedChange={(checked) => 
                  updatePreferences({ milestoneNotifications: checked })
                }
              />
            </div>

            {/* Milestone interval */}
            {preferences.milestoneNotifications && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="milestone-interval">Milestone Interval</Label>
                  <p className="text-sm text-muted-foreground">
                    How often to send milestone notifications
                  </p>
                </div>
                <Select 
                  value={preferences.milestoneInterval.toString()} 
                  onValueChange={handleMilestoneIntervalChange}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {!hasPermission && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <Bell className="h-4 w-4 inline mr-1" />
              Notification permission is required to receive desktop notifications. 
              Click "Grant Permission" above to enable this feature.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
