import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNewsletterSignup = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const signUpForNewsletter = async (email: string, source: "hero" | "popup") => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use secure function that handles duplicates without exposing existing emails
      const { data, error } = await supabase.rpc('safe_newsletter_signup', {
        p_email: email.toLowerCase()
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      
      const result = data as { success: boolean; message: string; already_subscribed: boolean };
      
      if (result.already_subscribed) {
        toast({
          title: "Already subscribed",
          description: "This email is already subscribed to our newsletter.",
          variant: "default",
        });
      } else {
        toast({
          title: "Successfully subscribed! 🎉",
          description: "Thank you for subscribing! Check your email for a welcome message.",
          variant: "default",
        });
      }

      // Trigger email notifications via edge function
      try {
        await supabase.functions.invoke("newsletter-notification", {
          body: { email, source }
        });
      } catch (emailError) {
        // Don't fail the subscription if email notification fails
        console.warn("Email notification failed:", emailError);
      }

    } catch (error: any) {
      console.error("Newsletter signup error:", error);
      toast({
        title: "Subscription failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    signUpForNewsletter,
    loading,
    success,
  };
};