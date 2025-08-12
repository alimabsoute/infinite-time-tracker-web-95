import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNewsletterSignup } from "@/hooks/useNewsletterSignup";

const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const SESSION_CAP = 2; // per session
const DAILY_CAP = 3; // per day

const SS_SESSION_COUNT_KEY = "newsletter-session-count";
const LS_DAILY_COUNT_KEY = "newsletter-daily-count";
const LS_DAILY_DATE_KEY = "newsletter-daily-date";
const LS_LAST_DISMISSED_AT = "newsletter-last-dismissed-at";

const NewsletterModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);
  const { signUpForNewsletter, loading, success } = useNewsletterSignup();

  useEffect(() => {
    // Check if user has already dismissed or signed up
    const dismissed = localStorage.getItem("newsletter-modal-dismissed");
    const subscribed = localStorage.getItem("newsletter-subscribed");
    
    if (dismissed || subscribed) {
      setIsDismissed(true);
      return;
    }

    // Frequency gating: cooldown, session cap, daily cap
    let timeoutId: NodeJS.Timeout;
    let hasScrolled = false;
    let hasShown = false;

    const normalizeDaily = () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const storedDate = localStorage.getItem(LS_DAILY_DATE_KEY);
        if (storedDate !== today) {
          localStorage.setItem(LS_DAILY_DATE_KEY, today);
          localStorage.setItem(LS_DAILY_COUNT_KEY, "0");
        }
      } catch {}
    };

    const canShow = () => {
      try {
        const lastDismissedAt = parseInt(
          localStorage.getItem(LS_LAST_DISMISSED_AT) || "0",
          10
        );
        const now = Date.now();
        if (lastDismissedAt && now - lastDismissedAt < COOLDOWN_MS) return false;

        const sessionCount = parseInt(
          sessionStorage.getItem(SS_SESSION_COUNT_KEY) || "0",
          10
        );
        if (sessionCount >= SESSION_CAP) return false;

        normalizeDaily();
        const dailyCount = parseInt(
          localStorage.getItem(LS_DAILY_COUNT_KEY) || "0",
          10
        );
        if (dailyCount >= DAILY_CAP) return false;

        return true;
      } catch {
        return true;
      }
    };

    const incrementCounts = () => {
      try {
        const sessionCount = parseInt(
          sessionStorage.getItem(SS_SESSION_COUNT_KEY) || "0",
          10
        );
        sessionStorage.setItem(SS_SESSION_COUNT_KEY, String(sessionCount + 1));

        normalizeDaily();
        const dailyCount = parseInt(
          localStorage.getItem(LS_DAILY_COUNT_KEY) || "0",
          10
        );
        localStorage.setItem(LS_DAILY_COUNT_KEY, String(dailyCount + 1));
      } catch {}
    };

    const showIfAllowed = () => {
      if (hasShown) return;
      if (canShow()) {
        hasShown = true;
        incrementCounts();
        setIsVisible(true);
      }
    };

    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 300) {
        hasScrolled = true;
        showIfAllowed();
      }
    };

    // Set timeout for 30 seconds
    timeoutId = setTimeout(() => {
      if (!hasScrolled) {
        showIfAllowed();
      }
    }, 30000);

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem(LS_LAST_DISMISSED_AT, String(Date.now()))
    } catch {}
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("newsletter-modal-dismissed", "true");
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      await signUpForNewsletter(email, "popup");
      if (success) {
        localStorage.setItem("newsletter-subscribed", "true");
        setEmail("");
        setTimeout(() => {
          setIsVisible(false);
          setIsDismissed(true);
        }, 2000);
      }
    }
  };

  if (isDismissed || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-background rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-primary/20"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="p-8">
            {success ? (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Welcome aboard! 🎉
                  </h3>
                  <p className="text-muted-foreground">
                    Thank you for subscribing! Check your email for a welcome message with exclusive tips.
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Don't miss out! 📧
                  </h3>
                  <p className="text-muted-foreground">
                    Join 1,000+ productivity enthusiasts getting exclusive tips, feature updates, and time-saving strategies.
                  </p>
                </div>

                {/* Benefits */}
                <div className="mb-6 space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>Weekly productivity tips</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>Early access to new features</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>Exclusive time management guides</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-primary/20 focus:border-primary"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        Get Free Tips & Updates
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Footer */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground mb-3">
                    No spam, unsubscribe anytime. We respect your privacy.
                  </p>
                  <button
                    onClick={handleDismiss}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Don't show this again
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewsletterModal;