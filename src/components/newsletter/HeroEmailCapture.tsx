import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNewsletterSignup } from "@/hooks/useNewsletterSignup";

const HeroEmailCapture = () => {
  const [email, setEmail] = useState("");
  const { signUpForNewsletter, loading, success } = useNewsletterSignup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      await signUpForNewsletter(email, "hero");
      if (success) {
        setEmail("");
      }
    }
  };

  if (success) {
    return (
      <motion.div
        className="relative mb-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 text-primary">
            <Check className="h-6 w-6" />
            <span className="text-lg font-medium">Thank you! Check your email for a welcome message.</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.8 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl blur-xl" />
      
      <div className="relative bg-gradient-to-r from-background/80 via-background/90 to-background/80 rounded-2xl border border-primary/20 p-6 backdrop-blur-sm">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Stay updated with PhynxTimer
          </h3>
          <p className="text-muted-foreground">
            Get productivity tips, feature updates, and exclusive content delivered to your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl border-primary/20 focus:border-primary bg-background/50"
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-3">
          No spam, unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </motion.div>
  );
};

export default HeroEmailCapture;