
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Crown, Users, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

// Pricing plans
const pricingPlans = [
  {
    name: "Free",
    price: "0",
    features: ["3 active timers", "7-day history", "Basic reports"],
    recommended: false,
    icon: Zap
  },
  {
    name: "Pro",
    price: "9.99",
    features: ["Unlimited timers", "Full history", "Advanced analytics", "Calendar integration", "Priority support"],
    recommended: true,
    icon: Crown
  },
  {
    name: "Business",
    price: "69.99",
    features: ["Everything in Pro", "Team collaboration", "API access", "Custom integrations", "Dedicated support", "Advanced reporting"],
    recommended: false,
    icon: Users
  }
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const floatingAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
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

const PricingCard = ({ plan, index }: { plan: typeof pricingPlans[0], index: number }) => {
  const { user } = useAuth();
  const { createCheckoutSession } = useSubscription();
  const IconComponent = plan.icon;

  const handleUpgradeClick = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const url = await createCheckoutSession();
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.2 }}
      className="relative group h-full"
    >
      {plan.recommended && (
        <motion.div
          animate={floatingAnimation}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            Most Popular
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className={`
          relative h-full backdrop-blur-2xl bg-white/25 border-2 border-white/40 rounded-2xl p-8 
          shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-105
          ${plan.recommended ? 'ring-2 ring-amber-400/70 bg-gradient-to-br from-white/35 to-white/20 border-white/50' : 'hover:bg-white/30'}
          overflow-hidden hover:border-white/60
        `}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Enhanced glassmorphism background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-white/15 rounded-2xl" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-pink-400/30 to-orange-600/30 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`
                p-3 rounded-xl backdrop-blur-sm border border-white/30
                ${plan.recommended ? 'bg-amber-500/30 text-amber-800 border-amber-400/50' : 'bg-white/30 text-slate-700 border-white/40'}
              `}>
                <IconComponent className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{plan.name}</h3>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex items-baseline">
              <span className="text-5xl font-bold text-slate-800">${plan.price}</span>
              <span className="text-slate-600 ml-2">/month</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8 flex-grow">
            {plan.features.map((feature, i) => (
              <motion.li 
                key={i} 
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">{feature}</span>
              </motion.li>
            ))}
          </ul>
          
          <div className="mt-auto">
            {plan.recommended ? (
              <Button 
                onClick={handleUpgradeClick}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              >
                <Crown className="mr-2 h-5 w-5" />
                Upgrade to Pro
              </Button>
            ) : plan.name === "Business" ? (
              <Button 
                onClick={handleUpgradeClick}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              >
                <Users className="mr-2 h-5 w-5" />
                Contact Sales
              </Button>
            ) : (
              <Link to="/signup" className="block w-full">
                <Button 
                  variant="outline" 
                  className="w-full bg-white/20 border-slate-500 text-slate-700 hover:bg-white/30 hover:border-slate-600 font-semibold py-3 rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PricingSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Enhanced background with glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-400 via-purple-400 to-slate-400" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:60px_60px] opacity-30" />
      
      {/* Floating background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/15 to-purple-600/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-pink-500/15 to-orange-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <motion.h2 
              className="text-5xl font-bold text-slate-800 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Choose Your Plan
            </motion.h2>
            <motion.p 
              className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Unlock your productivity potential with our flexible pricing options. 
              Start free and scale as you grow.
            </motion.p>
          </div>
        </FadeInWhenVisible>
        
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div>
        
        <FadeInWhenVisible>
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="text-slate-600 text-lg">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </motion.div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
};

export default PricingSection;
