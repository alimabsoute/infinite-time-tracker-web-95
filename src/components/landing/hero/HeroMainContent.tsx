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
    <div className="max-w-4xl">
      {/* Main headline */}
      <motion.h1 
        className="text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-tight"
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
        className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed"
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
        className="flex flex-col sm:flex-row gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Link to="/signup">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Start for free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </Link>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline" 
            size="lg"
            className="text-lg px-8 py-6 rounded-xl border-2 hover:bg-accent/10 transition-all duration-300"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch demo
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