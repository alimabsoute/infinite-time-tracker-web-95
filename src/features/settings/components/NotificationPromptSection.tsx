
import React from 'react';
import NotificationPrompt from "../notifications/NotificationPrompt";

interface NotificationPromptSectionProps {
  showNotificationPrompt: boolean;
  onDismissNotificationPrompt: () => void;
}

const NotificationPromptSection: React.FC<NotificationPromptSectionProps> = ({
  showNotificationPrompt,
  onDismissNotificationPrompt
}) => {
  if (!showNotificationPrompt) return null;

  return (
    <div className="mb-6">
      <NotificationPrompt onDismiss={onDismissNotificationPrompt} />
    </div>
  );
};

export default NotificationPromptSection;
