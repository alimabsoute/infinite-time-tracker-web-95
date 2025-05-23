
import React from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Clock, Calendar, BarChart3, Users } from "lucide-react";

// Features for the feature section
const features = [
  { 
    icon: <Clock className="h-10 w-10 text-primary" />,
    title: "Time Tracking",
    description: "Effortlessly track time spent on any task or project with a single click"
  },
  { 
    icon: <Calendar className="h-10 w-10 text-primary" />,
    title: "Calendar Integration",
    description: "Visualize your productivity patterns with our integrated calendar view"
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
      staggerChildren: 0.2
    }
  }
};

const FadeInWhenVisible = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

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
          <h2 className="text-3xl font-bold text-center mb-16">Powerful Features</h2>
        </FadeInWhenVisible>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={fadeIn}
              className="flex flex-col items-center text-center bg-card rounded-xl p-6 shadow-sm border transition-all hover:shadow-md"
            >
              <div className="mb-4 p-3 rounded-full bg-primary/10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
