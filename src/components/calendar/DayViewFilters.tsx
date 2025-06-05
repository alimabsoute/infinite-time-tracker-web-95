
import React from 'react';
import CategoryFilter from './CategoryFilter';

interface DayViewFiltersProps {
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}

const DayViewFilters: React.FC<DayViewFiltersProps> = ({
  categoryFilter,
  setCategoryFilter,
  categories
}) => {
  return (
    <div className="mb-4">
      <CategoryFilter 
        categoryFilter={categoryFilter} 
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />
    </div>
  );
};

export default DayViewFilters;
