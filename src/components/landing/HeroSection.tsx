import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Calendar, Clock, Play, Pause, Flag, AlertCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PhynxTimerLogo from "../PhynxTimerLogo";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const handleUpgradeClick = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      
      if (error) {
        console.error("Error creating checkout session:", error);
        return;
      }

      if (data.success && data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

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

              <Button 
                onClick={handleUpgradeClick}
                size="lg" 
                className="rounded-full text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Crown className="mr-2 h-5 w-5" />
                Upgrade to Pro
              </Button>
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
                <div className="rounded-full bg-emerald-500/10 p-3 mb-2">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
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
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-muted bg-card p-6">
              <div className="relative w-full overflow-hidden rounded-xl">
                {/* Realistic Timer Interface */}
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h3 className="font-semibold text-lg">Active Timers</h3>
                    <Badge variant="secondary" className="text-xs">3/3 Free</Badge>
                  </div>

                  {/* Timer Cards */}
                  <div className="space-y-3">
                    {/* Active Timer */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                          <span className="font-medium text-sm">Frontend Development</span>
                          <Badge variant="outline" className="text-xs h-5">Work</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flag className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-muted-foreground">High</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 transform -rotate-90">
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                className="text-primary/20"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 20 * 0.75} ${2 * Math.PI * 20}`}
                                className="text-primary"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold">2:34</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-lg font-bold">02:34:15</p>
                            <p className="text-xs text-muted-foreground">Running</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Pause className="h-4 w-4" />
                          </Button>
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        </div>
                      </div>
                    </div>

                    {/* Paused Timer */}
                    <div className="bg-background border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                          <span className="font-medium text-sm">Client Meeting Prep</span>
                          <Badge variant="outline" className="text-xs h-5">Meeting</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flag className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">Med</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 transform -rotate-90">
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                className="text-muted/20"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 20 * 0.45} ${2 * Math.PI * 20}`}
                                className="text-accent"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold">0:45</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-lg font-bold">00:45:32</p>
                            <p className="text-xs text-muted-foreground">Paused</p>
                          </div>
                        </div>
                        
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Completed Timer */}
                    <div className="bg-background border border-border rounded-lg p-4 opacity-75">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <span className="font-medium text-sm">Code Review</span>
                          <Badge variant="outline" className="text-xs h-5">Review</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flag className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs text-muted-foreground">Low</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 transform -rotate-90">
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                className="text-muted/20"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 20} ${2 * Math.PI * 20}`}
                                className="text-emerald-500"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold">1:15</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-lg font-bold">01:15:20</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </div>
                        </div>
                        
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
