import { json } from '@sveltejs/kit'
import { supabaseAdmin } from '$lib/server/supabase.js'

export async function GET({ cookies }) {
  try {
    // Get user from session
    const sessionCookie = cookies.get('sb-access-token')
    if (!sessionCookie) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(sessionCookie)
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()
    
    if (profileError || !profile?.is_admin) {
      return json({ error: 'Access denied' }, { status: 403 })
    }
    
    return json({ access: true })
    
  } catch (error) {
    console.error('Admin access check error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}