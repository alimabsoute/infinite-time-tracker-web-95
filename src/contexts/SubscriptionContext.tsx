
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SubscriptionTier = "free" | "pro" | "team";

interface SubscriptionContextType {
  subscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: Date | null;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckoutSession: () => Promise<string | null>;
  createCustomerPortalSession: () => Promise<string | null>;
  getTimerLimit: () => number;
  canCreateTimer: (currentTimerCount: number) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

// Helper function to validate and normalize subscription tier
const normalizeSubscriptionTier = (tier: string | null | undefined): SubscriptionTier => {
  if (tier === "pro" || tier === "team") {
    return tier;
  }
  return "free";
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free");
  const [subscriptionEnd, setSubscriptionEnd] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTimerLimit = (): number => {
    switch (subscriptionTier) {
      case "free":
        return 3;
      case "pro":
        return Infinity;
      case "team":
        return Infinity;
      default:
        return 3;
    }
  };

  const canCreateTimer = (currentTimerCount: number): boolean => {
    const limit = getTimerLimit();
    return limit === Infinity || currentTimerCount < limit;
  };

  const checkSubscription = async () => {
    if (!user) {
      setSubscribed(false);
      setSubscriptionTier("free");
      setSubscriptionEnd(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // The edge function is the single source of truth.
      // It syncs with Stripe and updates our 'subscribers' table.
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Error checking subscription via function:", error);
        // Fallback to reading directly from the database if the function fails
        // NOTE: We cast to `any` because the auto-generated Supabase types might be
        // stale after a migration, causing build errors. This is a temporary workaround.
        const { data: dbData, error: dbError } = await (supabase.from('subscribers') as any)
          .select('subscribed, subscription_tier, subscription_end')
          .eq('user_id', user.id)
          .single();

        if (dbError) {
          console.error("Error fetching subscription from DB:", dbError);
          toast.error("Failed to check subscription status");
          setSubscribed(false);
          setSubscriptionTier("free");
          setSubscriptionEnd(null);
        } else if (dbData) {
          toast.info("Displaying last known subscription status.");
          setSubscribed(dbData.subscribed ?? false);
          setSubscriptionTier(normalizeSubscriptionTier(dbData.subscription_tier));
          setSubscriptionEnd(dbData.subscription_end ? new Date(dbData.subscription_end) : null);
        }
        return;
      }

      if (data.success) {
        setSubscribed(data.subscribed);
        setSubscriptionTier(normalizeSubscriptionTier(data.subscription_tier));
        setSubscriptionEnd(data.subscription_end ? new Date(data.subscription_end) : null);
      } else {
        // The function executed but returned success: false
        toast.error(data.error || "An unknown error occurred while checking subscription.");
      }
    } catch (error) {
      console.error("Error in checkSubscription process:", error);
      toast.error("A critical error occurred while checking subscription status.");
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckoutSession = async (): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to subscribe");
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      
      if (error) {
        console.error("Error creating checkout session:", error);
        toast.error("Failed to create checkout session");
        return null;
      }

      if (data.success && data.url) {
        return data.url;
      }
      
      return null;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to create checkout session");
      return null;
    }
  };

  const createCustomerPortalSession = async (): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to manage your subscription");
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) {
        console.error("Error creating customer portal session:", error);
        toast.error("Failed to access subscription management");
        return null;
      }

      if (data.success && data.url) {
        return data.url;
      }
      
      return null;
    } catch (error) {
      console.error("Error creating customer portal session:", error);
      toast.error("Failed to access subscription management");
      return null;
    }
  };

  // Check subscription when user changes
  useEffect(() => {
    checkSubscription();
    // We also set up a regular check every 30 minutes in case the subscription status changes elsewhere
    const intervalId = setInterval(checkSubscription, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [user]);

  const value = {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    isLoading,
    checkSubscription,
    createCheckoutSession,
    createCustomerPortalSession,
    getTimerLimit,
    canCreateTimer
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
