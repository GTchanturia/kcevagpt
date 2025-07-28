<script>
  import { onMount } from 'svelte'
  import { user } from '$lib/stores/auth.js'
  import PricingCard from '$lib/components/PricingCard.svelte'
  import { goto } from '$app/navigation'
  
  const plans = {
    free: {
      name: 'Free',
      price: 0,
      tokens: 1000,
      features: ['Basic AI Chat', '1,000 tokens/month', 'Email support']
    },
    pro: {
      name: 'Pro',
      price: 9.99,
      tokens: 50000,
      features: ['Advanced AI Chat', '50,000 tokens/month', 'Priority support', 'Chat history']
    },
    enterprise: {
      name: 'Enterprise',
      price: 29.99,
      tokens: 200000,
      features: ['Premium AI Chat', '200,000 tokens/month', '24/7 support', 'Custom integrations', 'API access']
    }
  }
  
  async function handlePlanSelect(plan) {
    if (!$user) {
      goto('/auth/signin')
      return
    }
    
    if (plan.price === 0) {
      // Free plan - redirect to dashboard
      goto('/dashboard')
      return
    }
    
    // Redirect to billing page with selected plan
    goto(`/billing?plan=${plan.name.toLowerCase()}`)
  }
</script>

<svelte:head>
  <title>Pricing - AI Chat Pro</title>
  <meta name="description" content="Choose the perfect plan for your AI chat needs. From free to enterprise, we have options for everyone." />
</svelte:head>

<div class="container mx-auto px-4 py-16">
  <!-- Header -->
  <div class="text-center mb-16">
    <h1 class="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
    <p class="text-xl text-base-content/70 max-w-2xl mx-auto">
      Choose the perfect plan for your needs. All plans include access to our advanced AI chat powered by Gemini 1.5 Pro.
    </p>
  </div>
  
  <!-- Pricing Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    <PricingCard 
      plan={plans.free} 
      onSelect={handlePlanSelect}
    />
    <PricingCard 
      plan={plans.pro} 
      isPopular={true}
      onSelect={handlePlanSelect}
    />
    <PricingCard 
      plan={plans.enterprise} 
      onSelect={handlePlanSelect}
    />
  </div>
  
  <!-- FAQ Section -->
  <div class="mt-20">
    <h2 class="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
    
    <div class="max-w-3xl mx-auto space-y-4">
      <div class="collapse collapse-plus bg-base-100 shadow">
        <input type="radio" name="faq-accordion" checked="checked" />
        <div class="collapse-title text-xl font-medium">
          What are tokens and how do they work?
        </div>
        <div class="collapse-content">
          <p>Tokens are units that measure AI usage. Each message you send and receive consumes tokens based on length and complexity. Your monthly token allowance resets at the beginning of each billing cycle.</p>
        </div>
      </div>
      
      <div class="collapse collapse-plus bg-base-100 shadow">
        <input type="radio" name="faq-accordion" />
        <div class="collapse-title text-xl font-medium">
          Can I upgrade or downgrade my plan anytime?
        </div>
        <div class="collapse-content">
          <p>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments.</p>
        </div>
      </div>
      
      <div class="collapse collapse-plus bg-base-100 shadow">
        <input type="radio" name="faq-accordion" />
        <div class="collapse-title text-xl font-medium">
          What payment methods do you accept?
        </div>
        <div class="collapse-content">
          <p>We accept all major credit cards through Stripe, PayPal payments, and are working on adding support for Georgian banks (TBC and Bank of Georgia).</p>
        </div>
      </div>
      
      <div class="collapse collapse-plus bg-base-100 shadow">
        <input type="radio" name="faq-accordion" />
        <div class="collapse-title text-xl font-medium">
          Is there a free trial for paid plans?
        </div>
        <div class="collapse-content">
          <p>Our Free plan serves as a trial with 1,000 tokens per month. You can experience our AI chat capabilities before deciding to upgrade to a paid plan.</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- CTA Section -->
  <div class="text-center mt-16">
    <h3 class="text-2xl font-bold mb-4">Ready to get started?</h3>
    <p class="text-base-content/70 mb-8">Join thousands of users already using AI Chat Pro</p>
    <div class="space-x-4">
      <a href="/auth/signup" class="btn btn-primary btn-lg">Start Free</a>
      <a href="/chat" class="btn btn-outline btn-lg">Try Demo</a>
    </div>
  </div>
</div>