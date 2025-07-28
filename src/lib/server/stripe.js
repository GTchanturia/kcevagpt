import Stripe from 'stripe'
import { STRIPE_SECRET_KEY } from '$env/static/private'

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
})

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    tokens: 1000,
    features: ['Basic AI Chat', '1,000 tokens/month', 'Email support']
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    tokens: 50000,
    features: ['Advanced AI Chat', '50,000 tokens/month', 'Priority support', 'Chat history']
  },
  enterprise: {
    name: 'Enterprise',
    price: 29.99,
    priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    tokens: 200000,
    features: ['Premium AI Chat', '200,000 tokens/month', '24/7 support', 'Custom integrations']
  }
}

export async function createCheckoutSession(priceId, customerId, successUrl, cancelUrl) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    
    return session
  } catch (error) {
    console.error('Stripe checkout error:', error)
    throw error
  }
}