import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Free to use &mdash; no credit card required
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Track your time.
            <br />
            <span className="text-muted-foreground">Own your focus.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Simple, beautiful time tracking with analytics that help you understand where your hours go. Start a timer, tag your work, see the patterns.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="min-w-[180px]">
                Start tracking free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="min-w-[180px]">
                <Play className="mr-2 h-4 w-4" />
                See it in action
              </Button>
            </Link>
          </div>
        </div>

        {/* Product preview */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-muted/50 border-b">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
              <span className="ml-2 text-xs text-muted-foreground">PhynxTimer Dashboard</span>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Today", value: "4h 23m", sub: "+12% vs avg" },
                  { label: "This week", value: "26h 45m", sub: "5 projects" },
                  { label: "Streak", value: "14 days", sub: "Personal best" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xl font-semibold font-mono">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  { name: "Product Design", time: "2h 15m", color: "bg-blue-500", running: true },
                  { name: "Client Meeting", time: "0h 45m", color: "bg-emerald-500", running: false },
                  { name: "Code Review", time: "1h 23m", color: "bg-purple-500", running: false },
                ].map((timer) => (
                  <div key={timer.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${timer.color} ${timer.running ? "running-dot" : ""}`} />
                      <span className="text-sm font-medium">{timer.name}</span>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">{timer.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
