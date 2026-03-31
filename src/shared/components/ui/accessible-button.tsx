
import React from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@shared/lib/utils';

interface AccessibleButtonProps extends ButtonProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  focusRing?: boolean;
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    className, 
    loading, 
    loadingText, 
    icon, 
    iconPosition = 'left',
    focusRing = true,
    disabled,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <Button
        ref={ref}
        className={cn(
          // Enhanced focus styles for better accessibility
          focusRing && "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
          "transition-all duration-200 ease-in-out",
          // Better hover states
          "hover:shadow-md hover:scale-105 active:scale-95",
          // Loading state styles
          loading && "cursor-wait opacity-80",
          className
        )}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <span 
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"
                role="status"
                aria-label="Loading"
              />
              {loadingText || "Loading..."}
            </>
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <span className="flex-shrink-0" aria-hidden="true">
                  {icon}
                </span>
              )}
              {children}
              {icon && iconPosition === 'right' && (
                <span className="flex-shrink-0" aria-hidden="true">
                  {icon}
                </span>
              )}
            </>
          )}
        </span>
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export { AccessibleButton };
