
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, Play, Calendar, TrendingUp, Plus } from "lucide-react";

interface EmptyStateProps {
  type: "timers" | "calendar" | "analytics";
  onCreateTimer?: () => void;
  showCreateButton?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  onCreateTimer, 
  showCreateButton = true 
}) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case "timers":
        return {
          icon: <Timer className="h-16 w-16 text-muted-foreground/60" />,
          title: "No timers yet",
          description: "Create your first timer to start tracking your time and boost productivity.",
          tips: [
            "Use descriptive names for your timers",
            "Set deadlines to stay on track",
            "Organize with categories like Work, Study, or Personal"
          ]
        };
      case "calendar":
        return {
          icon: <Calendar className="h-16 w-16 text-muted-foreground/60" />,
          title: "No activity for this date",
          description: "Start tracking time to see your daily activity patterns and productivity insights.",
          tips: [
            "Create timers to track different activities",
            "Check the calendar view to see your progress",
            "Review your time patterns to optimize productivity"
          ]
        };
      case "analytics":
        return {
          icon: <TrendingUp className="h-16 w-16 text-muted-foreground/60" />,
          title: "No data to analyze yet",
          description: "Track time with your timers to generate meaningful analytics and insights.",
          tips: [
            "Use timers consistently to build data",
            "Categorize your activities for better insights",
            "Review weekly and monthly patterns"
          ]
        };
      default:
        return {
          icon: <Timer className="h-16 w-16 text-muted-foreground/60" />,
          title: "Getting started",
          description: "Welcome to PhynxTimer! Let's help you get started.",
          tips: []
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <Card className="w-full max-w-md border-dashed border-2 border-muted-foreground/20 bg-muted/10">
        <CardContent className="pt-8 pb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            {content.icon}
          </motion.div>
          
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-semibold mb-2"
          >
            {content.title}
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-6"
          >
            {content.description}
          </motion.p>

          {content.tips.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-left mb-6"
            >
              <h4 className="text-sm font-medium mb-2 text-center">Quick tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {content.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {showCreateButton && onCreateTimer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button onClick={onCreateTimer} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Timer
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmptyState;
