
import React from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Clock, Calendar, BarChart3, Users, Tag, Bell, Zap, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";

// Features for the feature section
const features = [
  { 
    icon: <Clock className="h-10 w-10 text-primary" />,
    title: "Smart Time Tracking",
    description: "Track time with a single click and organize tasks by projects, clients or categories"
  },
  { 
    icon: <Calendar className="h-10 w-10 text-primary" />,
    title: "Interactive Calendar",
    description: "Visualize your productivity patterns across days, weeks, and months"
  },
  { 
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: "Detailed Analytics",
    description: "Gain insights into how you spend your time with comprehensive charts and reports"
  },
  { 
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Team Collaboration",
    description: "Share timers and reports with your team for better project management"
  },
  { 
    icon: <Tag className="h-10 w-10 text-primary" />,
    title: "Custom Labels",
    description: "Organize your time with custom categories and color-coding for easy identification"
  },
  { 
    icon: <Bell className="h-10 w-10 text-primary" />,
    title: "Smart Reminders",
    description: "Get notified about important deadlines and upcoming time commitments"
  },
  { 
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Productivity Insights",
    description: "Identify your most productive hours and optimize your work schedule"
  },
  { 
    icon: <Layers className="h-10 w-10 text-primary" />,
    title: "Project Management",
    description: "Track time per project and analyze where your resources are being allocated"
  }
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const FadeInWhenVisible = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeIn}
    >
      {children}
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <FadeInWhenVisible>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Powerful Features</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Everything you need to master your time and boost productivity
          </p>
        </FadeInWhenVisible>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="h-full flex flex-col items-center text-center p-6 shadow-sm border transition-all hover:shadow-md bg-card/50 backdrop-blur-sm">
                <div className="mb-4 p-3 rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
