
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@shared/lib/supabase/client';
import { toast } from 'sonner';

interface SubscriptionContextType {
  subscribed: boolean;
  subscriptionTier: string | null;
  loading: boolean;
  getTimerLimit: () => number;
  getRunningTimerLimit: () => number;
  canCreateTimer: (currentCount: number) => boolean;
  canStartTimer: (currentRunningCount: number) => boolean;
  createCheckoutSession: () => Promise<string | null>;
  createCustomerPortalSession: () => Promise<string | null>;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getTimerLimit = () => {
    return subscribed ? Infinity : 3;
  };

  const getRunningTimerLimit = () => {
    return subscribed ? Infinity : 3;
  };

  const canCreateTimer = (currentCount: number) => {
    const limit = getTimerLimit();
    return limit === Infinity || currentCount < limit;
  };

  const canStartTimer = (currentRunningCount: number) => {
    const limit = getRunningTimerLimit();
    return limit === Infinity || currentRunningCount < limit;
  };

  const checkSubscription = async () => {
    if (!user) {
      setSubscribed(false);
      setSubscriptionTier(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        setSubscribed(false);
        setSubscriptionTier(null);
      } else {
        setSubscribed(data.subscribed || false);
        setSubscriptionTier(data.subscription_tier || null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscribed(false);
      setSubscriptionTier(null);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (): Promise<string | null> => {
    if (!user) {
      toast.error("Please sign in to upgrade your subscription");
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        console.error('Error creating checkout session:', error);
        toast.error('Failed to create checkout session');
        return null;
      }

      if (data.success && data.url) {
        return data.url;
      } else {
        toast.error('Failed to create checkout session');
        return null;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
      return null;
    }
  };

  const createCustomerPortalSession = async (): Promise<string | null> => {
    if (!user) {
      toast.error("Please sign in to manage your subscription");
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Error creating customer portal session:', error);
        toast.error('Failed to create customer portal session');
        return null;
      }

      if (data.success && data.url) {
        return data.url;
      } else {
        toast.error('Failed to create customer portal session');
        return null;
      }
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      toast.error('Failed to create customer portal session');
      return null;
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  const value = {
    subscribed,
    subscriptionTier,
    loading,
    getTimerLimit,
    getRunningTimerLimit,
    canCreateTimer,
    canStartTimer,
    createCheckoutSession,
    createCustomerPortalSession,
    checkSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
