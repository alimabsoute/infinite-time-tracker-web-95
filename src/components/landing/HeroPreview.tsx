
import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Flag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroPreview = () => {
  return (
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
  );
};

export default HeroPreview;
