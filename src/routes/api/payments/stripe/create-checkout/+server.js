import { json } from '@sveltejs/kit'
import { stripe, SUBSCRIPTION_PLANS } from '$lib/server/stripe.js'
import { supabaseAdmin } from '$lib/server/supabase.js'
import { PUBLIC_APP_URL } from '$env/static/public'

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
    
    // Create or get Stripe customer
    let customerId
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()
    
    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      })
      
      customerId = customer.id
      
      // Update user profile with Stripe customer ID
      await supabaseAdmin
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PUBLIC_APP_URL}/billing?plan=${plan}`,
      metadata: {
        user_id: user.id,
        plan: plan
      }
    })
    
    return json({ url: session.url })
    
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}