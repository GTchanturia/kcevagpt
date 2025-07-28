import { json } from '@sveltejs/kit'
import { supabaseAdmin } from '$lib/server/supabase.js'

export async function GET({ cookies }) {
  try {
    // Get user from session
    const sessionCookie = cookies.get('sb-access-token')
    if (!sessionCookie) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify session and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(sessionCookie)
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (profileError) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('user_profiles')
        .insert([
          {
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            subscription_plan: 'free',
            tokens_used: 0,
            tokens_remaining: 1000,
            token_limit: 1000,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()
      
      if (createError) {
        return json({ error: 'Failed to create user profile' }, { status: 500 })
      }
      
      return json(newProfile)
    }
    
    return json(profile)
    
  } catch (error) {
    console.error('Profile API error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}