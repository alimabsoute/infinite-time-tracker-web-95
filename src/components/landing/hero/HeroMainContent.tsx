import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const HeroMainContent = () => {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is handled in the AuthContext
    }
  };

  return (
    <div className="max-w-6xl w-full">
      {/* Main headline */}
      <motion.h1 
        className="text-7xl lg:text-8xl xl:text-9xl font-bold text-foreground mb-10 leading-tight max-w-5xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        The fastest way to{" "}
        <motion.span 
          className="text-primary"
          animate={{ 
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          track your time
        </motion.span>
        .
      </motion.h1>

      {/* Subtitle */}
      <motion.p 
        className="text-2xl lg:text-3xl text-muted-foreground mb-16 max-w-4xl leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        PhynxTimer helps you understand how you spend your time with unlimited running timers, 
        advanced analytics, and goal tracking. Start with 3 free timers, then unlock the full power 
        with our Pro plan.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-6 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Link to="/signup">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-2xl px-12 py-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 glow-primary"
            >
              Start for Free
              <ArrowRight className="ml-3 h-7 w-7" />
            </Button>
          </motion.div>
        </Link>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="outline" 
            size="lg"
            className="text-2xl px-12 py-8 rounded-2xl border-4 border-slate-800 bg-white/90 backdrop-blur-sm text-slate-800 hover:bg-white hover:border-slate-900 transition-all duration-300 glow-secondary"
          >
            <Play className="mr-3 h-7 w-7" />
            Watch Demo
          </Button>
        </motion.div>
      </motion.div>

      {/* Social proof */}
      <motion.div 
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        ✨ No credit card required • Free 3 timers forever
      </motion.div>
    </div>
  );
};

export default HeroMainContent;