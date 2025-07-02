
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Timer, BarChart3, Target, Zap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhynxTimerLogo from "../PhynxTimerLogo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const HeroContent = () => {
  const { signInWithGoogle } = useAuth();

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

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is handled in the AuthContext
    }
  };

  const features = [
    { icon: Timer, text: "Multiple Running Timers", delay: 0.2 },
    { icon: BarChart3, text: "Advanced Analytics", delay: 0.4 },
    { icon: Target, text: "Goal Tracking", delay: 0.6 },
    { icon: Zap, text: "Real-time Sync", delay: 0.8 }
  ];

  return (
    <motion.div 
      className="text-center lg:text-left relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced floating background elements */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full -z-10"
          animate={{
            x: [0, 100 + i * 20, 0],
            y: [0, -80 - i * 10, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 360, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 6 + i * 0.5,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
          style={{
            left: `${5 + i * 12}%`,
            top: `${10 + (i % 4) * 20}%`,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8, type: "spring", bounce: 0.3 }}
        className="inline-flex items-center gap-3 mb-6"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1.05, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <PhynxTimerLogo width={96} height={96} className="text-primary" />
        </motion.div>
        <motion.h1 
          className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
          animate={{ 
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            backgroundPosition: { duration: 5, repeat: Infinity },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ backgroundSize: "200% 200%" }}
        >
          PhynxTimer
        </motion.h1>
      </motion.div>
      
      <motion.h2 
        className="text-2xl md:text-4xl font-medium mb-6 text-foreground/90"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <motion.span
          animate={{ 
            color: ["#000", "#6366f1", "#8b5cf6", "#000"],
            textShadow: [
              "0 0 0px currentColor",
              "0 0 20px currentColor", 
              "0 0 10px currentColor",
              "0 0 0px currentColor"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          Track your time,
        </motion.span>{" "}
        <motion.span
          animate={{ 
            color: ["#000", "#8b5cf6", "#6366f1", "#000"],
            textShadow: [
              "0 0 0px currentColor",
              "0 0 20px currentColor", 
              "0 0 10px currentColor",
              "0 0 0px currentColor"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        >
          boost your productivity
        </motion.span>
      </motion.h2>
      
      <motion.p 
        className="text-lg mb-8 text-muted-foreground max-w-xl mx-auto lg:mx-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        PhynxTimer helps you understand how you spend your time with{" "}
        <motion.span 
          className="text-primary font-semibold"
          animate={{ 
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          unlimited running timers
        </motion.span>
        , advanced analytics, and goal tracking. Start with 3 free timers,
        then unlock the full power with our Pro plan.
      </motion.p>

      {/* Enhanced Animated Feature Pills */}
      <motion.div 
        className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8, y: 20, rotateX: 45 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            transition={{ delay: feature.delay, duration: 0.5 }}
            whileHover={{ 
              scale: 1.1, 
              y: -5,
              rotateY: 10,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition-all duration-300 rounded-full px-4 py-2 text-sm border border-primary/20 shadow-md"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <feature.icon className="h-4 w-4 text-primary" />
            </motion.div>
            <span>{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Enhanced Button Section */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <Link to="/signup">
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto rounded-full text-lg px-8 py-6 upgrade-btn-animated shadow-xl hover:shadow-2xl relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              Get Started Free 
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.div>
            </Button>
          </motion.div>
        </Link>

        <motion.div
          whileHover={{ scale: 1.05, rotateY: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={handleGoogleSignIn}
            size="lg" 
            className="w-full sm:w-auto rounded-full text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl transition-all duration-200 relative overflow-hidden"
          >
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
            <motion.svg 
              className="mr-2 h-5 w-5" 
              viewBox="0 0 24 24"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </motion.svg>
            Continue with Google
          </Button>
        </motion.div>
      </motion.div>
      
      {/* Updated Sign In and Upgrade buttons */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <Link to="/login">
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto rounded-full text-lg px-8 py-6 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-xl hover:shadow-2xl transition-all duration-200 relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <LogIn className="mr-2 h-5 w-5" />
              </motion.div>
              Sign In
            </Button>
          </motion.div>
        </Link>

        <motion.div
          whileHover={{ scale: 1.05, rotateY: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={handleUpgradeClick}
            size="lg" 
            className="w-full sm:w-auto rounded-full text-lg px-8 py-6 upgrade-btn-animated shadow-xl hover:shadow-2xl relative overflow-hidden"
          >
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Crown className="mr-2 h-5 w-5" />
            </motion.div>
            Upgrade to Pro
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default HeroContent;
