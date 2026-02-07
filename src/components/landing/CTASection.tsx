import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-3">
          Ready to take control of your time?
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Join thousands of people who track their time with PhynxTimer. Free forever, upgrade when you want.
        </p>
        <Link to="/signup">
          <Button size="lg">
            Start tracking for free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
