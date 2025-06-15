
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

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
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">Enable Notifications</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-blue-700">
          Get notified when your timers complete or reach milestones
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button 
            onClick={handleEnableNotifications}
            disabled={isRequesting}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRequesting ? 'Requesting...' : 'Enable Notifications'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDismiss}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPrompt;
