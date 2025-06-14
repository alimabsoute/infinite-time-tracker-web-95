
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Pricing plans
const pricingPlans = [
  {
    name: "Free",
    price: "0",
    features: ["3 active timers", "7-day history", "Basic reports"],
    recommended: false
  },
  {
    name: "Pro",
    price: "9.99",
    features: ["Unlimited timers", "Full history", "Advanced analytics", "Calendar integration", "Priority support"],
    recommended: true
  }
];

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

const PricingSection = () => {
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
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <FadeInWhenVisible>
          <h2 className="text-3xl font-bold text-center mb-4">Pricing Plans</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Choose the plan that works best for you and start tracking your time more effectively today.
          </p>
        </FadeInWhenVisible>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <FadeInWhenVisible key={index}>
              <div className={`relative bg-card rounded-xl p-6 shadow-sm border h-full flex flex-col ${
                plan.recommended ? 'border-primary shadow-md' : ''
              }`}>
                {plan.recommended && (
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                    Recommended
                  </div>
                )}
                
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-5">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.recommended ? (
                  <Button 
                    onClick={handleUpgradeClick}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                ) : (
                  <Link to="/signup" className="mt-auto">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
