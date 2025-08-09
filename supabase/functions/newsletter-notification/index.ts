import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, source } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get admin email from environment or use default
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'your-email@example.com'
    
    // Email service credentials (add these to Supabase secrets)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send admin notification email
    const adminEmailData = {
      from: 'PhynxTimer <noreply@phynxtimer.com>',
      to: [adminEmail],
      subject: '🎉 New Newsletter Subscriber!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Newsletter Subscriber</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Source:</strong> ${source === 'hero' ? 'Hero Section' : 'Popup Modal'}</p>
          <p><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            This notification was sent automatically from your PhynxTimer newsletter system.
          </p>
        </div>
      `
    }

    // Send welcome email to subscriber
    const welcomeEmailData = {
      from: 'PhynxTimer <noreply@phynxtimer.com>',
      to: [email],
      subject: 'Welcome to PhynxTimer! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to PhynxTimer! 🎉</h1>
            <p style="color: #666; font-size: 18px;">Thank you for subscribing to our newsletter!</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e293b; margin-bottom: 15px;">What you can expect:</h3>
            <ul style="color: #475569; line-height: 1.6;">
              <li>📊 Weekly productivity tips and time management strategies</li>
              <li>🚀 Early access to new PhynxTimer features</li>
              <li>📚 Exclusive guides and resources</li>
              <li>💡 Insights from productivity experts</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://phynxtimer.com/dashboard" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Using PhynxTimer →
            </a>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; color: #64748b; font-size: 14px;">
            <p>Best regards,<br>The PhynxTimer Team</p>
            <p style="margin-top: 15px;">
              <a href="[UNSUBSCRIBE_URL]" style="color: #64748b;">Unsubscribe</a> | 
              <a href="https://phynxtimer.com" style="color: #64748b;">Visit our website</a>
            </p>
          </div>
        </div>
      `
    }

    // Send both emails using Resend
    const responses = await Promise.allSettled([
      // Admin notification
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminEmailData),
      }),
      // Welcome email
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(welcomeEmailData),
      })
    ])

    console.log('Email responses:', responses)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Newsletter signup processed and emails sent',
        adminEmailSent: responses[0].status === 'fulfilled',
        welcomeEmailSent: responses[1].status === 'fulfilled'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in newsletter-notification function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})