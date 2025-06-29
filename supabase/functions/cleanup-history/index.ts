
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧹 Starting history cleanup process...');

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log(`🗓️ Cleaning up data older than: ${sevenDaysAgo.toISOString()}`);

    // Get all non-subscribed users
    const { data: freeUsers, error: usersError } = await supabaseAdmin
      .from('subscribers')
      .select('user_id')
      .eq('subscribed', false);

    if (usersError) {
      console.error('❌ Error fetching free users:', usersError);
      throw usersError;
    }

    if (!freeUsers || freeUsers.length === 0) {
      console.log('ℹ️ No free users found, skipping cleanup');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No free users found',
          cleaned: { timers: 0, sessions: 0 }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const freeUserIds = freeUsers.map(u => u.user_id);
    console.log(`👥 Found ${freeUserIds.length} free users`);

    // Clean up old timer sessions for free users
    const { data: deletedSessions, error: sessionsError } = await supabaseAdmin
      .from('timer_sessions')
      .delete()
      .in('user_id', freeUserIds)
      .lt('created_at', sevenDaysAgo.toISOString())
      .select('id');

    if (sessionsError) {
      console.error('❌ Error deleting old timer sessions:', sessionsError);
      throw sessionsError;
    }

    const deletedSessionsCount = deletedSessions?.length || 0;
    console.log(`🗑️ Deleted ${deletedSessionsCount} old timer sessions`);

    // Clean up old timers for free users (that haven't been accessed in 7+ days)
    const { data: deletedTimers, error: timersError } = await supabaseAdmin
      .from('timers')
      .delete()
      .in('user_id', freeUserIds)
      .lt('last_accessed_at', sevenDaysAgo.toISOString())
      .is('deleted_at', null) // Only clean up non-deleted timers
      .select('id');

    if (timersError) {
      console.error('❌ Error deleting old timers:', timersError);
      throw timersError;
    }

    const deletedTimersCount = deletedTimers?.length || 0;
    console.log(`🗑️ Deleted ${deletedTimersCount} old timers`);

    console.log('✅ History cleanup completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'History cleanup completed',
        cleaned: {
          timers: deletedTimersCount,
          sessions: deletedSessionsCount
        },
        freeUsersProcessed: freeUserIds.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error in cleanup-history function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
