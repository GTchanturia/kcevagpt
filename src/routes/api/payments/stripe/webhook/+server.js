import { json } from '@sveltejs/kit'
import { stripe, SUBSCRIPTION_PLANS } from '$lib/server/stripe.js'
import { supabaseAdmin } from '$lib/server/supabase.js'
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private'

export async function POST({ request }) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    return json({ received: true })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session) {
  const userId = session.metadata.user_id
  const plan = session.metadata.plan
  
  if (!userId || !plan) return
  
  const planDetails = SUBSCRIPTION_PLANS[plan]
  if (!planDetails) return
  
  // Update user profile
  await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_plan: plan,
      stripe_subscription_id: session.subscription,
      tokens_remaining: planDetails.tokens,
      token_limit: planDetails.tokens,
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
  
  // Log payment
  await supabaseAdmin
    .from('payments')
    .insert([
      {
        user_id: userId,
        amount: planDetails.price,
        currency: 'usd',
        status: 'completed',
        payment_method: 'stripe',
        stripe_payment_intent_id: session.payment_intent,
        plan: plan,
        created_at: new Date().toISOString()
      }
    ])
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer
  
  // Find user by Stripe customer ID
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()
  
  if (!profile) return
  
  await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_status: subscription.status,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', profile.user_id)
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer
  
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()
  
  if (!profile) return
  
  // Downgrade to free plan
  await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_plan: 'free',
      subscription_status: 'canceled',
      tokens_remaining: 1000,
      token_limit: 1000,
      stripe_subscription_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', profile.user_id)
}

async function handlePaymentSucceeded(invoice) {
  // Reset monthly tokens on successful payment
  const customerId = invoice.customer
  
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id, subscription_plan')
    .eq('stripe_customer_id', customerId)
    .single()
  
  if (!profile) return
  
  const planDetails = SUBSCRIPTION_PLANS[profile.subscription_plan]
  if (!planDetails) return
  
  await supabaseAdmin
    .from('user_profiles')
    .update({
      tokens_used: 0,
      tokens_remaining: planDetails.tokens,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', profile.user_id)
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer
  
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()
  
  if (!profile) return
  
  await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', profile.user_id)
}