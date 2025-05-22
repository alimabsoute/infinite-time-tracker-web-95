
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, ChevronsUpDown } from "lucide-react";

interface FilterPanelProps {
  showFilters: boolean;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  showFilters,
  categoryFilter,
  setCategoryFilter,
  categories
}) => {
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div 
          className="mb-6 p-4 border border-border/30 rounded-lg bg-background/50 backdrop-blur-sm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <h3 className="text-sm font-medium mb-1">Category</h3>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Date Range</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <ArrowLeftRight size={12} className="mr-1" />
                  This Month
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <ChevronsUpDown size={12} className="mr-1" />
                  Custom Range
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterPanel;
