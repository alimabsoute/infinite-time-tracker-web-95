import React, { useMemo, useState } from 'react';
import { addDays } from 'date-fns';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Timer } from '../../types';
import { motion } from 'framer-motion';
import DetailedDeadlinesModal from './DetailedDeadlinesModal';

interface UrgentDeadlinesBannerProps {
  timers: Timer[];
}

const UrgentDeadlinesBanner: React.FC<UrgentDeadlinesBannerProps> = ({ timers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'thisWeek' | 'nextWeek' | 'all'>('all');

  const deadlineStats = useMemo(() => {
    const now = new Date();
    const thisWeekEnd = addDays(now, 7);
    const nextWeekEnd = addDays(now, 14);

    const thisWeekDeadlines = timers.filter(timer => 
      timer.deadline && 
      new Date(timer.deadline) <= thisWeekEnd
    );

    const nextWeekDeadlines = timers.filter(timer => 
      timer.deadline && 
      new Date(timer.deadline) > thisWeekEnd &&
      new Date(timer.deadline) <= nextWeekEnd
    );

    const totalDeadlines = timers.filter(timer => timer.deadline).length;

    return {
      thisWeek: thisWeekDeadlines.length,
      nextWeek: nextWeekDeadlines.length,
      total: totalDeadlines
    };
  }, [timers]);

  const handleStatCardClick = (filter: 'thisWeek' | 'nextWeek' | 'all') => {
    setSelectedFilter(filter);
    setIsModalOpen(true);
  };

  const handleViewAllClick = () => {
    setSelectedFilter('all');
    setIsModalOpen(true);
  };

  if (deadlineStats.total === 0) {
    return null;
  }

  return (
    <>
      <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-red-500 text-white p-4 rounded-lg mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Urgent Deadlines</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div 
              className="text-center cursor-pointer transition-all duration-200 hover:bg-white/10 rounded-lg p-2 -m-2"
              onClick={() => handleStatCardClick('thisWeek')}
            >
              <div className="text-2xl font-bold">{deadlineStats.thisWeek}</div>
              <div className="text-xs opacity-90">This Week</div>
            </div>
            
            <div 
              className="text-center cursor-pointer transition-all duration-200 hover:bg-white/10 rounded-lg p-2 -m-2"
              onClick={() => handleStatCardClick('nextWeek')}
            >
              <div className="text-2xl font-bold">{deadlineStats.nextWeek}</div>
              <div className="text-xs opacity-90">Next Week</div>
            </div>
            
            <div 
              className="text-center cursor-pointer transition-all duration-200 hover:bg-white/10 rounded-lg p-2 -m-2"
              onClick={() => handleStatCardClick('all')}
            >
              <div className="text-2xl font-bold">{deadlineStats.total}</div>
              <div className="text-xs opacity-90">Total</div>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={handleViewAllClick}
        >
          View All Details
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </motion.div>
    
    <DetailedDeadlinesModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      timers={timers}
      initialFilter={selectedFilter}
    />
    </>
  );
};

export default UrgentDeadlinesBanner;