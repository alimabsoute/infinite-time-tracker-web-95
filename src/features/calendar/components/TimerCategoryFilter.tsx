
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';

const TIMER_CATEGORIES = ['Work', 'Personal', 'Study', 'Exercise', 'Health', 'Uncategorized'];

interface TimerCategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const TimerCategoryFilter: React.FC<TimerCategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {TIMER_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimerCategoryFilter;
