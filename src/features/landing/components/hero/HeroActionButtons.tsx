import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Crown, LogIn } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { supabase } from "@shared/lib/supabase/client";
import { useAuth } from "@features/auth/context/AuthContext";
const HeroActionButtons = () => {
  const {
    signInWithGoogle
  } = useAuth();
  const handleUpgradeClick = async () => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("create-checkout");
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
  return <>
      {/* Primary Action Buttons */}
      <motion.div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 1,
      duration: 0.6
    }}>
        <Link to="/signup">
          <motion.div whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <Button size="lg" className="w-full sm:w-auto rounded-full text-lg px-8 py-6 upgrade-btn-animated shadow-xl hover:shadow-2xl">
              Get Started Free 
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </Link>

        <motion.div whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          <Button onClick={handleGoogleSignIn} size="lg" className="w-full sm:w-auto rounded-full text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl transition-all duration-200">
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>
        </motion.div>
      </motion.div>
      
      {/* Secondary Action Buttons */}
      <motion.div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 1.2,
      duration: 0.6
    }}>
        <Link to="/login">
          <motion.div whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <Button size="lg" className="w-full sm:w-auto rounded-full text-lg px-8 py-6 bg-gradient-to-r from-slate-600/90 to-slate-700/90 hover:from-slate-700/90 hover:to-slate-800/90 text-white shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-sm border border-white/10 bg-blue-700 hover:bg-blue-600">
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </Button>
          </motion.div>
        </Link>

        <motion.div whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          <Button onClick={handleUpgradeClick} size="lg" className="w-full sm:w-auto rounded-full text-lg px-8 py-6 upgrade-btn-animated shadow-xl hover:shadow-2xl backdrop-blur-sm">
            <Crown className="mr-2 h-5 w-5" />
            Upgrade to Pro
          </Button>
        </motion.div>
      </motion.div>
    </>;
};
export default HeroActionButtons;