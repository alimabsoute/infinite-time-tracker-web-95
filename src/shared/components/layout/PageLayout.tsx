
import React from 'react';
import Navigation from './Navigation';
import ResponsiveContainer from './ResponsiveContainer';
import { cn } from '@shared/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'compact' | 'expanded';
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  title, 
  description, 
  actions,
  variant = 'default',
  className
}) => {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <Navigation />
      
      <main 
        className="pb-8 sm:pb-12 lg:pb-16"
        role="main"
        aria-label="Main content"
      >
        <ResponsiveContainer variant={variant} padding="medium">
          {/* Enhanced page header with better typography scale */}
          {(title || description || actions) && (
            <header className="py-6 sm:py-8 lg:py-12">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                  {title && (
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-3 leading-relaxed max-w-3xl">
                      {description}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                    {actions}
                  </div>
                )}
              </div>
            </header>
          )}
          
          {/* Main content area with improved spacing */}
          <section 
            className="space-y-6 sm:space-y-8 lg:space-y-10"
            aria-label="Page content"
          >
            {children}
          </section>
        </ResponsiveContainer>
      </main>
    </div>
  );
};

export default PageLayout;
