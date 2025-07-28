import { json } from '@sveltejs/kit'
import { supabaseAdmin } from '$lib/server/supabase.js'

export async function GET({ cookies }) {
  try {
    // Check admin access
    const sessionCookie = cookies.get('sb-access-token')
    if (!sessionCookie) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(sessionCookie)
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()
    
    if (!profile?.is_admin) {
      return json({ error: 'Access denied' }, { status: 403 })
    }
    
    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (usersError) {
      return json({ error: 'Failed to fetch users' }, { status: 500 })
    }
    
    return json(users)
    
  } catch (error) {
    console.error('Admin users API error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}