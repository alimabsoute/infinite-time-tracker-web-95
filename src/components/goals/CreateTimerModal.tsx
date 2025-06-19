
import React from 'react';
import { Button } from '@/components/ui/button';
import CreateTimerForm from '@/components/CreateTimerForm';

interface CreateTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTimer: (name: string) => Promise<void>;
  currentTimerCount: number;
}

const CreateTimerModal: React.FC<CreateTimerModalProps> = ({
  isOpen,
  onClose,
  onAddTimer,
  currentTimerCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <CreateTimerForm 
          onAddTimer={onAddTimer}
          currentTimerCount={currentTimerCount}
        />
        <Button 
          variant="outline" 
          onClick={onClose}
          className="mt-4 w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CreateTimerModal;
