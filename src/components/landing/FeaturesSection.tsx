import React from "react";
import { Clock, BarChart3, Calendar, Tag, Zap, Layers } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "One-click timers",
    description: "Start tracking instantly. Tag by project, client, or category. No setup required.",
  },
  {
    icon: BarChart3,
    title: "Visual analytics",
    description: "See where your time goes with charts, breakdowns, and weekly patterns.",
  },
  {
    icon: Calendar,
    title: "Calendar view",
    description: "Visualize your productivity across days, weeks, and months at a glance.",
  },
  {
    icon: Tag,
    title: "Custom labels",
    description: "Color-code and categorize your time entries to stay organized.",
  },
  {
    icon: Zap,
    title: "Productivity insights",
    description: "Identify your most productive hours and optimize your work schedule.",
  },
  {
    icon: Layers,
    title: "Project tracking",
    description: "Track time per project and understand where your effort is going.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Everything you need
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Simple tools that work together to give you clarity on how you spend your time.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-lg border bg-card p-6 hover:shadow-sm transition-shadow"
              >
                <div className="mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
