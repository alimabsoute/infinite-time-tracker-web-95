import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhynxTimerLogo from "../PhynxTimerLogo";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-br from-background via-background to-background">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary/20"></div>
        <div className="absolute bottom-40 right-20 w-60 h-60 rounded-full bg-primary/10"></div>
        <div className="absolute top-40 right-40 w-20 h-20 rounded-full bg-accent/20"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <PhynxTimerLogo width={48} height={48} className="text-primary" />
              <h1 className="text-5xl md:text-7xl font-bold">PhynxTimer</h1>
            </motion.div>
            
            <motion.h2 
              className="text-2xl md:text-4xl font-medium mb-6 text-foreground/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Track your time, boost your productivity
            </motion.h2>
            
            <motion.p 
              className="text-lg mb-8 text-muted-foreground max-w-xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              PhynxTimer helps you understand how you spend your time, 
              so you can focus on what matters most. Start with 3 free timers,
              then unlock unlimited tracking with our Pro plan.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Link to="/signup">
                <Button size="lg" className="rounded-full text-lg px-8 py-6">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link to="/login">
                <Button variant="outline" size="lg" className="rounded-full text-lg px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm">Time Tracking</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-accent/10 p-3 mb-2">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <p className="text-sm">Calendar View</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-secondary/20 p-3 mb-2">
                  <BarChart3 className="h-5 w-5 text-secondary-foreground" />
                </div>
                <p className="text-sm">Analytics</p>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="aspect-square md:aspect-video relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-muted bg-card p-4">
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                {/* Timer preview visualization */}
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="flex flex-col justify-center items-center bg-background/50 rounded-lg p-3">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-primary"
                        style={{ 
                          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
                          transform: 'rotate(45deg)'
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">45:12</span>
                      </div>
                    </div>
                    <span className="mt-2 text-sm font-medium">Project A</span>
                  </div>
                  
                  <div className="flex flex-col justify-center items-center bg-background/50 rounded-lg p-3">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-accent"
                        style={{ 
                          clipPath: 'polygon(0 0, 75% 0, 75% 75%, 0% 75%)',
                          transform: 'rotate(0deg)'
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">23:48</span>
                      </div>
                    </div>
                    <span className="mt-2 text-sm font-medium">Task B</span>
                  </div>
                  
                  <div className="flex flex-col justify-center items-center bg-background/50 rounded-lg p-3">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 rounded-full border-4 border-secondary/20"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-secondary"
                        style={{ 
                          clipPath: 'polygon(0 0, 30% 0, 30% 30%, 0% 30%)',
                          transform: 'rotate(0deg)'
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">15:31</span>
                      </div>
                    </div>
                    <span className="mt-2 text-sm font-medium">Meeting</span>
                  </div>
                  
                  <div className="flex flex-col justify-center items-center bg-background/50 rounded-lg p-3">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                      <motion.div 
                        className="absolute inset-0 rounded-full border-4 border-primary"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
                        animate={{ 
                          transform: ['rotate(0deg)', 'rotate(360deg)']
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 10, 
                          ease: "linear"
                        }}
                      ></motion.div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">01:23</span>
                      </div>
                    </div>
                    <span className="mt-2 text-sm font-medium">Active Timer</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-primary/5 -z-10"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-accent/5 -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
