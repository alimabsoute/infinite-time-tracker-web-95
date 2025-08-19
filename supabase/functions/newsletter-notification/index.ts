import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('[NEWSLETTER-NOTIFICATION] Function started')
  
  if (req.method === 'OPTIONS') {
    console.log('[NEWSLETTER-NOTIFICATION] Handling CORS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { email, source } = body
    
    console.log('[NEWSLETTER-NOTIFICATION] Received request:', { email, source })

    // Validate input
    if (!email) {
      console.error('[NEWSLETTER-NOTIFICATION] Missing email in request')
      return new Response(
        JSON.stringify({ success: false, error: 'Email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'ali.mabsoute@hyatt.com'
    
    console.log('[NEWSLETTER-NOTIFICATION] Environment check:', { 
      hasResendKey: !!resendApiKey,
      adminEmail 
    })
    
    if (!resendApiKey) {
      console.error('[NEWSLETTER-NOTIFICATION] RESEND_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey)
    console.log('[NEWSLETTER-NOTIFICATION] Resend client initialized')

    // Send admin notification email
    console.log('[NEWSLETTER-NOTIFICATION] Sending admin notification email to:', adminEmail)
    const adminEmailResult = await resend.emails.send({
      from: 'PhynxTimer <onboarding@resend.dev>',
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
    })

    console.log('[NEWSLETTER-NOTIFICATION] Admin email result:', adminEmailResult)

    // Send welcome email to subscriber
    console.log('[NEWSLETTER-NOTIFICATION] Sending welcome email to:', email)
    const welcomeEmailResult = await resend.emails.send({
      from: 'PhynxTimer <onboarding@resend.dev>',
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
            <a href="https://guqmcoyneloryomuukyw.supabase.co/dashboard" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Using PhynxTimer →
            </a>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; color: #64748b; font-size: 14px;">
            <p>Best regards,<br>The PhynxTimer Team</p>
            <p style="margin-top: 15px;">
              <a href="#" style="color: #64748b;">Unsubscribe</a> | 
              <a href="https://phynxtimer.com" style="color: #64748b;">Visit our website</a>
            </p>
          </div>
        </div>
      `
    })

    console.log('[NEWSLETTER-NOTIFICATION] Welcome email result:', welcomeEmailResult)

    // Check for errors
    if (adminEmailResult.error) {
      console.error('[NEWSLETTER-NOTIFICATION] Admin email failed:', adminEmailResult.error)
    }
    
    if (welcomeEmailResult.error) {
      console.error('[NEWSLETTER-NOTIFICATION] Welcome email failed:', welcomeEmailResult.error)
    }

    const response = {
      success: true,
      message: 'Newsletter signup processed and emails sent',
      adminEmailSent: !adminEmailResult.error,
      welcomeEmailSent: !welcomeEmailResult.error,
      adminEmailId: adminEmailResult.data?.id,
      welcomeEmailId: welcomeEmailResult.data?.id
    }

    console.log('[NEWSLETTER-NOTIFICATION] Final response:', response)

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[NEWSLETTER-NOTIFICATION] Error in function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})