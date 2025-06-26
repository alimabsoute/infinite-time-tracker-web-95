
import React from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

interface AnimatedNavButtonProps extends ButtonProps {
  isActive?: boolean;
  children: React.ReactNode;
}

const AnimatedNavButton = React.forwardRef<HTMLButtonElement, AnimatedNavButtonProps>(
  ({ className, isActive, children, ...props }, ref) => {
    return (
      <div className="relative group">
        {/* Animated border background */}
        <div className={cn(
          "absolute inset-0 rounded-lg bg-gradient-to-r opacity-0 transition-opacity duration-300",
          "from-blue-500 via-purple-500 to-pink-500 bg-[length:200%_200%]",
          "animate-[gradient-shift_3s_ease-in-out_infinite]",
          "group-hover:opacity-100",
          isActive && "opacity-100"
        )} />
        
        {/* Inner animated border */}
        <div className={cn(
          "absolute inset-[2px] rounded-md bg-background transition-all duration-300",
          "group-hover:inset-[3px]",
          isActive && "inset-[3px]"
        )} />
        
        {/* Button content */}
        <Button
          ref={ref}
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "relative z-10 transition-all duration-300 border-0",
            "group-hover:shadow-lg group-hover:scale-105",
            "active:scale-95",
            isActive && "shadow-lg scale-105",
            className
          )}
          {...props}
        >
          {children}
        </Button>
      </div>
    );
  }
);

AnimatedNavButton.displayName = 'AnimatedNavButton';

export { AnimatedNavButton };
