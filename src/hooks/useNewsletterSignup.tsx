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
      // Check if email already exists in subscribers table
      const { data: existing, error: checkError } = await supabase
        .from("subscribers")
        .select("id")
        .eq("email", email.toLowerCase())
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" which is expected for new emails
        throw checkError;
      }

      if (existing) {
        toast({
          title: "Already subscribed",
          description: "This email is already subscribed to our newsletter.",
          variant: "default",
        });
        setSuccess(true);
        return;
      }

      // Insert new subscriber - using existing subscribers table with required fields
      const { error: insertError } = await supabase
        .from("subscribers")
        .insert({
          email: email.toLowerCase(),
          user_id: crypto.randomUUID(), // Generate temp ID for newsletter signups
          subscribed: true,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      toast({
        title: "Successfully subscribed! 🎉",
        description: "Thank you for subscribing! Check your email for a welcome message.",
        variant: "default",
      });

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