import { json } from '@sveltejs/kit'
import { createPayPalOrder } from '$lib/server/paypal.js'
import { supabaseAdmin } from '$lib/server/supabase.js'
import { SUBSCRIPTION_PLANS } from '$lib/server/stripe.js'

export async function POST({ request, cookies }) {
  try {
    const { plan } = await request.json()
    
    // Get user from session
    const sessionCookie = cookies.get('sb-access-token')
    if (!sessionCookie) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(sessionCookie)
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Validate plan
    if (!SUBSCRIPTION_PLANS[plan]) {
      return json({ error: 'Invalid plan' }, { status: 400 })
    }
    
    const selectedPlan = SUBSCRIPTION_PLANS[plan]
    
    // Create PayPal order
    const order = await createPayPalOrder(selectedPlan.price)
    
    // Store order info in database
    await supabaseAdmin
      .from('paypal_orders')
      .insert([
        {
          user_id: user.id,
          order_id: order.id,
          plan: plan,
          amount: selectedPlan.price,
          status: 'created',
          created_at: new Date().toISOString()
        }
      ])
    
    // Get approval URL
    const approvalUrl = order.links.find(link => link.rel === 'approve')?.href
    
    return json({ 
      orderId: order.id,
      approvalUrl 
    })
    
  } catch (error) {
    console.error('PayPal order creation error:', error)
    return json({ error: 'Failed to create PayPal order' }, { status: 500 })
  }
}