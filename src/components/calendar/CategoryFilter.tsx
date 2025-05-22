
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryFilterProps {
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categories: string[];
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categoryFilter, setCategoryFilter, categories }) => {
  return (
    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
      <SelectTrigger className="bg-secondary/50 border-secondary">
        <SelectValue placeholder="Filter by category" />
      </SelectTrigger>
      <SelectContent className="bg-secondary border-secondary text-foreground">
        <SelectItem value="all">All Categories</SelectItem>
        {categories.sort().map(category => (
          <SelectItem key={category} value={category}>{category}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategoryFilter;
