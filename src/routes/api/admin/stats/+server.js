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
    
    // Get statistics
    const [
      { count: totalUsers },
      { count: activeUsers },
      { data: revenueData },
      { count: totalMessages }
    ] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('payments').select('amount').eq('status', 'completed'),
      supabaseAdmin.from('chat_messages').select('*', { count: 'exact', head: true })
    ])
    
    const totalRevenue = revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0
    
    return json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalRevenue: totalRevenue,
      totalMessages: totalMessages || 0
    })
    
  } catch (error) {
    console.error('Admin stats API error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}