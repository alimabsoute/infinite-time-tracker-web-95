
import React from 'react';
import Navigation from './Navigation';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  title, 
  description, 
  actions 
}) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {(title || description || actions) && (
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                {title && (
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-muted-foreground mt-2">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center space-x-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
