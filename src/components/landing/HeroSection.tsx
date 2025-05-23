
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 bg-gradient-to-br from-background via-background to-background">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary/20"></div>
        <div className="absolute bottom-40 right-20 w-60 h-60 rounded-full bg-primary/10"></div>
        <div className="absolute top-40 right-40 w-20 h-20 rounded-full bg-accent/20"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div 
            className="max-w-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="mb-6 flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                <h1 className="text-4xl md:text-6xl font-bold">TimeKeeper</h1>
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-2xl md:text-3xl font-medium mb-6 text-foreground/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Track your time, boost your productivity
            </motion.h2>
            
            <motion.p 
              className="text-lg mb-8 text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              TimeKeeper helps you understand how you spend your time, 
              so you can focus on what matters most. Effortless tracking, 
              powerful insights, and beautiful visualizations.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Link to="/signup">
                <Button size="lg" className="rounded-full">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              <Link to="/login">
                <Button variant="outline" size="lg" className="rounded-full">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="relative overflow-hidden rounded-2xl shadow-2xl border border-muted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Hero image/animation */}
            <div className="w-full max-w-md overflow-hidden">
              {/* Fallback animated placeholder */}
              <div className="aspect-video w-full bg-card p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="h-4 w-1/3 bg-muted rounded"></div>
                </div>
                <div className="flex flex-col space-y-2">
                  <motion.div 
                    className="h-8 w-3/4 bg-accent/20 rounded"
                    animate={{ width: ["60%", "75%", "68%"] }}
                    transition={{ repeat: Infinity, duration: 5, repeatType: "reverse", ease: "easeInOut" }}
                  ></motion.div>
                  <motion.div 
                    className="h-8 w-1/2 bg-primary/30 rounded"
                    animate={{ width: ["40%", "50%", "45%"] }}
                    transition={{ repeat: Infinity, duration: 7, repeatType: "reverse", ease: "easeInOut", delay: 0.5 }}
                  ></motion.div>
                  <motion.div 
                    className="h-8 w-2/3 bg-secondary/40 rounded"
                    animate={{ width: ["55%", "65%", "60%"] }}
                    transition={{ repeat: Infinity, duration: 6, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
