
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface GoalsDashboardHeaderProps {
  onCreateTimer: () => void;
}

const GoalsDashboardHeader: React.FC<GoalsDashboardHeaderProps> = ({
  onCreateTimer
}) => {
  return (
    <Button onClick={onCreateTimer}>
      <Plus className="h-4 w-4 mr-2" />
      New Timer
    </Button>
  );
};

export default GoalsDashboardHeader;
