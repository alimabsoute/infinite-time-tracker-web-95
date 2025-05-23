
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
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

const benefits = [
  "Track unlimited timers",
  "Analyze productivity patterns",
  "Visualize time spent across projects",
  "Set goals and monitor progress"
];

const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-primary/10 to-accent/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <FadeInWhenVisible>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-6">Ready to Take Control of Your Time?</h2>
            <p className="text-lg md:text-xl text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of users who have improved their productivity with TimeKeeper.
              Start tracking your time more effectively today.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-8 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <p className="text-lg">{benefit}</p>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/signup">
                <Button size="lg" className="rounded-full px-8 py-6 text-lg">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link to="/login">
                <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </FadeInWhenVisible>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
