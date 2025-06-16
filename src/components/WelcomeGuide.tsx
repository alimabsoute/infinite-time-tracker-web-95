
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ArrowRight, Calendar, TrendingUp, Target } from "lucide-react";
import PhynxTimerLogo from "./PhynxTimerLogo";

interface WelcomeGuideProps {
  onClose: () => void;
  onCreateTimer: () => void;
}

const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ onClose, onCreateTimer }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <PhynxTimerLogo width={32} height={32} className="text-primary" />,
      title: "Track Your Time",
      description: "Create timers for different activities like work, study, or personal projects. Click play to start tracking!"
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Set Goals & Deadlines",
      description: "Add deadlines to your timers and set priorities to stay focused on what matters most."
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "View Your Progress",
      description: "Check the calendar view to see your daily activity patterns and track your productivity over time."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Analyze & Improve",
      description: "Use the analytics tab to understand your time patterns and optimize your productivity."
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onCreateTimer();
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Welcome to PhynxTimer!</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                {steps[currentStep].icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {steps[currentStep].title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button onClick={nextStep}>
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeGuide;
