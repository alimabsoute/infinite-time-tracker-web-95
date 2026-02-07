import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "For personal use",
    features: [
      "5 active timers",
      "7-day history",
      "Basic analytics",
      "Calendar view",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "4.99",
    description: "For power users",
    features: [
      "Unlimited timers",
      "Full history",
      "Advanced analytics & reports",
      "Project tracking",
      "Data export (CSV)",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

const PricingSection = () => {
  const { user } = useAuth();
  const { createCheckoutSession } = useSubscription();

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const url = await createCheckoutSession();
    if (url) window.open(url, "_blank");
  };

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Simple pricing
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start free. Upgrade when you need more. No surprises.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-6 ${
                plan.highlighted
                  ? "border-primary shadow-sm ring-1 ring-primary"
                  : "bg-card"
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full mb-4">
                  Recommended
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.highlighted ? (
                <Button className="w-full" onClick={handleUpgrade}>
                  {plan.cta}
                </Button>
              ) : (
                <Link to="/signup">
                  <Button variant="outline" className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
