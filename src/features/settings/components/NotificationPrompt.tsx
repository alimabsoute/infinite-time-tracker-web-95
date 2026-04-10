
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@shared/hooks/useNotifications';

interface NotificationPromptProps {
  onDismiss: () => void;
}

const NotificationPrompt: React.FC<NotificationPromptProps> = ({ onDismiss }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const { requestPermission } = useNotifications();

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    await requestPermission();
    setIsRequesting(false);
    onDismiss();
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg text-foreground">Enable Notifications</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Get notified when your timers complete or reach milestones
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            onClick={handleEnableNotifications}
            disabled={isRequesting}
            size="sm"
          >
            {isRequesting ? 'Requesting...' : 'Enable Notifications'}
          </Button>
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPrompt;
