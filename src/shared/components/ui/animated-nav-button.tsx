
import React from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@shared/lib/utils';

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
          "absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300",
          "bg-gradient-to-r from-purple-400 via-pink-400 to-red-400",
          "bg-[length:300%_300%] animate-[gradient-shift_4s_ease-in-out_infinite]",
          "group-hover:opacity-100",
          isActive && "opacity-100"
        )} />
        
        {/* Inner background with thin border effect */}
        <div className={cn(
          "absolute inset-[1px] rounded-md bg-background transition-all duration-300"
        )} />
        
        {/* Button content */}
        <Button
          ref={ref}
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "relative z-10 transition-all duration-300 border-0 px-3 py-2",
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
