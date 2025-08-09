# Email Newsletter Setup Guide

## Overview
Your PhynxTimer app now has a complete email capture system with:
- ✅ Elegant email capture field in hero section  
- ✅ Strategic popup modal after 30 seconds or scroll
- ✅ Database integration with existing `subscribers` table
- ✅ Success/error handling with toast notifications
- ✅ Edge function for email notifications

## Current Status
The frontend components are fully functional and integrated. To enable email notifications, you need to complete the backend setup.

## Required Setup (5 minutes)

### 1. Get Resend API Key (Recommended Email Service)
1. Go to [Resend.com](https://resend.com) and create a free account
2. Generate an API key from your dashboard
3. Copy the API key (starts with `re_`)

### 2. Configure Supabase Secrets
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add these environment variables:

```
RESEND_API_KEY=re_your_actual_api_key_here
ADMIN_EMAIL=your-email@example.com
```

### 3. Deploy the Edge Function
The edge function `newsletter-notification` is already created. To deploy it:

1. Install Supabase CLI if you haven't already
2. Link your project: `supabase link --project-ref your-project-ref`
3. Deploy the function: `supabase functions deploy newsletter-notification`

## How It Works

### Email Capture Sources
- **Hero Section**: Prominent email field below main CTA buttons
- **Popup Modal**: Appears after 30 seconds or when user scrolls down 300px
- **Smart Tracking**: Each source is tracked separately for analytics

### Email Flow
1. User enters email → Stored in `subscribers` table
2. Edge function triggers automatically 
3. **Admin Alert**: You get instant email notification
4. **Welcome Email**: User receives branded welcome message
5. **Analytics**: Track signups by source (hero vs popup)

### Features
- ✅ Duplicate email protection
- ✅ Email validation
- ✅ Animated success states  
- ✅ "Don't show again" option for popup
- ✅ Mobile-responsive design
- ✅ Accessible form elements

## Email Templates

### Admin Notification
- Subject: "🎉 New Newsletter Subscriber!"
- Contains: Email, source, timestamp
- Helps you track growth in real-time

### Welcome Email  
- Subject: "Welcome to PhynxTimer! 🚀"
- Branded template with:
  - Welcome message
  - Feature highlights
  - Call-to-action to start using the app
  - Unsubscribe link

## Customization Options

### Popup Timing
Edit `src/components/newsletter/NewsletterModal.tsx`:
```typescript
// Show after different time (currently 30 seconds)
timeoutId = setTimeout(() => {
  setIsVisible(true);
}, 45000); // Change to 45 seconds

// Or different scroll trigger (currently 300px)
if (window.scrollY > 500) { // Change to 500px
  setIsVisible(true);
}
```

### Email Templates
Modify the HTML templates in `supabase/functions/newsletter-notification/index.ts` to match your branding.

## Analytics Dashboard (Future Enhancement)
You can view newsletter signups in your Supabase dashboard:
1. Go to **Table Editor** → **subscribers**  
2. Filter by recent signups
3. Analyze conversion by source

## Troubleshooting

### No emails being sent?
1. Check Supabase Edge Function logs
2. Verify `RESEND_API_KEY` is set correctly
3. Ensure your Resend domain is verified

### Users not seeing popup?
- Check browser localStorage for dismissed state
- Verify scroll/timing triggers in browser dev tools

### Duplicate emails?
The system automatically prevents duplicate signups and shows appropriate messages.

## Cost Considerations
- **Resend Free Tier**: 3,000 emails/month free
- **Supabase**: Newsletter storage included in free tier  
- **Edge Functions**: 500,000 invocations/month free

## Security Notes
- All email capture works without authentication
- Spam protection through email validation
- Rate limiting handled by Supabase
- User privacy respected with easy unsubscribe

Your email capture system is now ready to start collecting subscribers! 🚀