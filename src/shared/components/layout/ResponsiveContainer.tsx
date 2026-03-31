
import React from 'react';
import { cn } from '@shared/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'expanded';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'medium'
}) => {
  const baseClasses = "w-full mx-auto";
  
  const variantClasses = {
    default: "max-w-7xl",
    compact: "max-w-4xl",
    expanded: "max-w-full"
  };
  
  const paddingClasses = {
    none: "",
    small: "px-2 sm:px-4",
    medium: "px-4 sm:px-6 lg:px-8",
    large: "px-6 sm:px-8 lg:px-12"
  };

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;
