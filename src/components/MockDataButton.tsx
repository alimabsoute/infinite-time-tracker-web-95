
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Database, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { generateMockData, clearExistingData } from "../utils/mockDataGenerator";

const MockDataButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { user } = useAuth();

  const handleGenerateMockData = async () => {
    if (!user) {
      toast.error("You must be logged in to generate mock data");
      return;
    }

    setIsGenerating(true);
    try {
      await generateMockData(user.id, 30); // Generate 30 days of data
      toast.success("Mock data generated successfully!", {
        description: "200+ timer entries have been created across different categories and time periods"
      });
    } catch (error) {
      console.error("Error generating mock data:", error);
      toast.error("Failed to generate mock data");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearData = async () => {
    if (!user) {
      toast.error("You must be logged in to clear data");
      return;
    }

    setIsClearing(true);
    try {
      await clearExistingData(user.id);
      toast.success("All timer data cleared successfully!");
    } catch (error) {
      console.error("Error clearing data:", error);
      toast.error("Failed to clear data");
    } finally {
      setIsClearing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            Generate Mock Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Mock Timer Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create 200+ mock timer entries spanning the last 30 days across 12 different categories. 
              This data will help you visualize how the dashboard looks with realistic usage patterns.
              <br /><br />
              <strong>Categories included:</strong> Work, Study, Personal, Health, Leisure, Project, Meeting, Research, Development, Design, Writing, Planning
              <br /><br />
              The data will include varied durations, realistic daily patterns, some deadlines, and priority levels.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerateMockData} disabled={isGenerating}>
              {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Generate Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Timer Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your timer data. This action cannot be undone.
              <br /><br />
              <strong>Warning:</strong> This will remove all timers, including any real data you may have created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} disabled={isClearing} variant="destructive">
              {isClearing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MockDataButton;
