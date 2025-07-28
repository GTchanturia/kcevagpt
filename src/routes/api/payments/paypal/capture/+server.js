import { json } from '@sveltejs/kit'
import { capturePayPalOrder } from '$lib/server/paypal.js'
import { supabaseAdmin } from '$lib/server/supabase.js'
import { SUBSCRIPTION_PLANS } from '$lib/server/stripe.js'

export async function POST({ request, cookies }) {
  try {
    const { orderId } = await request.json()
    
    // Get user from session
    const sessionCookie = cookies.get('sb-access-token')
    if (!sessionCookie) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(sessionCookie)
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get order from database
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('paypal_orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single()
    
    if (orderError || !orderData) {
      return json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Capture PayPal payment
    const capture = await capturePayPalOrder(orderId)
    
    if (capture.status === 'COMPLETED') {
      const planDetails = SUBSCRIPTION_PLANS[orderData.plan]
      
      // Update user profile
      await supabaseAdmin
        .from('user_profiles')
        .update({
          subscription_plan: orderData.plan,
          tokens_remaining: planDetails.tokens,
          token_limit: planDetails.tokens,
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      
      // Update order status
      await supabaseAdmin
        .from('paypal_orders')
        .update({
          status: 'completed',
          capture_id: capture.id,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
      
      // Log payment
      await supabaseAdmin
        .from('payments')
        .insert([
          {
            user_id: user.id,
            amount: orderData.amount,
            currency: 'usd',
            status: 'completed',
            payment_method: 'paypal',
            paypal_order_id: orderId,
            plan: orderData.plan,
            created_at: new Date().toISOString()
          }
        ])
      
      return json({ success: true, capture })
    } else {
      return json({ error: 'Payment capture failed' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('PayPal capture error:', error)
    return json({ error: 'Failed to capture payment' }, { status: 500 })
  }
}