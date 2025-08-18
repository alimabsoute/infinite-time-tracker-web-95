import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNewsletterSignup = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const signUpForNewsletter = async (email: string, source: "hero" | "popup") => {
    // Enhanced email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use new secure newsletter signup function with validation and rate limiting
      const { data, error } = await supabase.rpc('secure_newsletter_signup', {
        p_email: email.toLowerCase(),
        p_source: source
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
      console.log("Invoking newsletter-notification function with:", { email, source });
      try {
        const response = await supabase.functions.invoke("newsletter-notification", {
          body: { email, source }
        });
        
        console.log("Edge function response:", response);
        
        if (response.error) {
          console.error("Email notification failed:", response.error);
          toast({
            title: "Subscribed successfully",
            description: "You're subscribed! There was a small issue sending the welcome email, but you're all set.",
            variant: "default",
          });
        } else {
          console.log("Email notification sent successfully");
        }
      } catch (emailError) {
        console.error("Email notification catch error:", emailError);
        toast({
          title: "Subscribed successfully", 
          description: "You're subscribed! There was a small issue sending the welcome email, but you're all set.",
          variant: "default",
        });
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