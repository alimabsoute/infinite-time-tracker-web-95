
import React from 'react';
import { Clock, Calendar, BarChart3, Timer, Play, Pause, Flag } from 'lucide-react';
import PhynxTimerLogo from '../PhynxTimerLogo';

const FacebookLaunchImage: React.FC = () => {
  return (
    <div className="w-[1200px] h-[630px] bg-gradient-to-br from-primary/5 via-background to-accent/10 relative overflow-hidden flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-primary/30"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-accent/30"></div>
        <div className="absolute top-40 right-40 w-20 h-20 rounded-full bg-primary/20"></div>
        <div className="absolute bottom-40 left-40 w-24 h-24 rounded-full bg-accent/20"></div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-12 grid grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side - Branding & Text */}
        <div className="space-y-8">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <PhynxTimerLogo width={64} height={64} className="text-primary" />
            <div>
              <h1 className="text-5xl font-bold text-foreground">PhynxTimer</h1>
              <p className="text-xl text-primary font-medium">Time Tracking Reimagined</p>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight text-foreground">
              Track Your Time,<br />
              <span className="text-primary">Boost Your Productivity</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              The intelligent time tracker that helps you understand how you spend your time and optimize your workflow.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Timer className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Smart Timers</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-2">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <span className="text-sm font-medium">Calendar View</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                <BarChart3 className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-sm font-medium">Analytics</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold">
              Get Started Free
            </div>
            <div className="text-muted-foreground">
              No credit card required
            </div>
          </div>
        </div>

        {/* Right Side - App Preview */}
        <div className="relative">
          {/* Mock App Interface */}
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            {/* App Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <h3 className="font-semibold text-lg">Active Timers</h3>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                3 Running
              </div>
            </div>

            {/* Timer Cards */}
            <div className="space-y-4">
              {/* Active Timer 1 */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    <span className="font-medium text-sm">Frontend Development</span>
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Work</div>
                  </div>
                  <Flag className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-primary/20" />
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray={`${2 * Math.PI * 16 * 0.75} ${2 * Math.PI * 16}`} className="text-primary" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold">2:45</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold">02:45:30</p>
                      <p className="text-xs text-muted-foreground">Running</p>
                    </div>
                  </div>
                  <Pause className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>
              </div>

              {/* Active Timer 2 */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                    <span className="font-medium text-sm">Design Review</span>
                    <div className="bg-accent/10 text-accent px-2 py-1 rounded text-xs">Meeting</div>
                  </div>
                  <Flag className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-accent/20" />
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray={`${2 * Math.PI * 16 * 0.45} ${2 * Math.PI * 16}`} className="text-accent" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold">1:20</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold">01:20:15</p>
                      <p className="text-xs text-muted-foreground">Running</p>
                    </div>
                  </div>
                  <Pause className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>
              </div>

              {/* Paused Timer */}
              <div className="bg-background border border-border rounded-lg p-4 opacity-75">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                    <span className="font-medium text-sm">Client Research</span>
                    <div className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">Study</div>
                  </div>
                  <Flag className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-muted/20" />
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray={`${2 * Math.PI * 16 * 0.25} ${2 * Math.PI * 16}`} className="text-muted-foreground" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold">0:35</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold">00:35:42</p>
                      <p className="text-xs text-muted-foreground">Paused</p>
                    </div>
                  </div>
                  <Play className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Stats Footer */}
            <div className="mt-6 pt-4 border-t border-border/50 flex justify-between text-sm">
              <div className="text-center">
                <p className="font-bold text-primary">4h 41m</p>
                <p className="text-muted-foreground">Today</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-accent">7</p>
                <p className="text-muted-foreground">Sessions</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-emerald-500">95%</p>
                <p className="text-muted-foreground">Focus</p>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            ✨ NEW
          </div>
          <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium">+23% productivity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Brand Strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-primary/5 backdrop-blur-sm border-t border-primary/10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">Smart Time Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-sm">Productivity Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm">Deadline Management</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Start tracking time smarter → PhynxTimer.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookLaunchImage;
