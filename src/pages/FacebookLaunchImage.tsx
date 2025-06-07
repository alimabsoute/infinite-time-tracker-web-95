
import React from 'react';
import FacebookLaunchImage from '../components/marketing/FacebookLaunchImage';

const FacebookLaunchImagePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Facebook Launch Image</h1>
          <p className="text-muted-foreground">1200x630px - Optimized for Facebook sharing</p>
        </div>
        
        <div className="border border-border rounded-lg overflow-hidden shadow-lg">
          <FacebookLaunchImage />
        </div>
        
        <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>This image is optimized for Facebook's recommended dimensions (1200x630px) and includes PhynxTimer's key features, branding elements, and a compelling call-to-action. You can screenshot this component or export it as needed for your Facebook launch.</p>
        </div>
      </div>
    </div>
  );
};

export default FacebookLaunchImagePage;
