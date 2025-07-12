import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataGenerator } from '@/utils/mockDataGenerator';
import { toast } from 'sonner';

export const useMockDataManager = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { user } = useAuth();

  const generateMockData = useCallback(async () => {
    if (!user) {
      toast.error("You must be logged in to generate mock data");
      return { success: false };
    }

    setIsGenerating(true);
    
    try {
      const result = await mockDataGenerator.generateMockData(user.id);
      
      if (result.success) {
        toast.success("Mock data generated successfully!", {
          description: result.message
        });
        
        // Trigger a page refresh to reload data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Failed to generate mock data", {
          description: result.message
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error generating mock data:', error);
      toast.error("Failed to generate mock data", {
        description: "An unexpected error occurred"
      });
      return { success: false };
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  const clearMockData = useCallback(async () => {
    if (!user) {
      toast.error("You must be logged in to clear mock data");
      return { success: false };
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear all mock data?\n\n" +
      "This will remove all timers and sessions with names starting with 'Mock'.\n\n" +
      "This action cannot be undone."
    );

    if (!confirmed) {
      toast.info("Mock data clearing cancelled");
      return { success: false };
    }

    setIsClearing(true);
    
    try {
      const result = await mockDataGenerator.clearMockData(user.id);
      
      if (result.success) {
        toast.success("Mock data cleared successfully!", {
          description: result.message
        });
        
        // Trigger a page refresh to reload data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Failed to clear mock data", {
          description: result.message
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error clearing mock data:', error);
      toast.error("Failed to clear mock data", {
        description: "An unexpected error occurred"
      });
      return { success: false };
    } finally {
      setIsClearing(false);
    }
  }, [user]);

  return {
    generateMockData,
    clearMockData,
    isGenerating,
    isClearing
  };
};