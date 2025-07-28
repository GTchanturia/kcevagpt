<script>
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { user } from '$lib/stores/auth.js'
  import { goto } from '$app/navigation'
  import { CreditCard, Check, AlertCircle } from 'lucide-svelte'
  
  let loading = true
  let userProfile = null
  let selectedPlan = null
  let paymentMethod = 'stripe' // 'stripe', 'paypal', 'tbc', 'bog'
  let processing = false
  let error = ''
  let success = ''
  
  const plans = {
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
  
  onMount(async () => {
    if (!$user) {
      goto('/auth/signin')
      return
    }
    
    // Get selected plan from URL params
    const planParam = $page.url.searchParams.get('plan')
    if (planParam && plans[planParam]) {
      selectedPlan = planParam
    }
    
    await fetchUserProfile()
  })
  
  async function fetchUserProfile() {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        userProfile = await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    } finally {
      loading = false
    }
  }
  
  async function handleStripePayment() {
    if (!selectedPlan) return
    
    processing = true
    error = ''
    
    try {
      const response = await fetch('/api/payments/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan: selectedPlan
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create checkout session')
      }
      
      const { url } = await response.json()
      window.location.href = url
      
    } catch (err) {
      error = err.message
      processing = false
    }
  }
  
  async function handlePayPalPayment() {
    if (!selectedPlan) return
    
    processing = true
    error = ''
    
    try {
      const response = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan: selectedPlan
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create PayPal order')
      }
      
      const { approvalUrl } = await response.json()
      window.location.href = approvalUrl
      
    } catch (err) {
      error = err.message
      processing = false
    }
  }
  
  function handlePayment() {
    switch (paymentMethod) {
      case 'stripe':
        handleStripePayment()
        break
      case 'paypal':
        handlePayPalPayment()
        break
      case 'tbc':
      case 'bog':
        error = 'Georgian bank payments are coming soon!'
        break
      default:
        error = 'Please select a payment method'
    }
  }
</script>

<svelte:head>
  <title>Billing - AI Chat Pro</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  {#if loading}
    <div class="flex justify-center items-center min-h-[50vh]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Billing & Subscriptions</h1>
      <p class="text-base-content/70">Manage your subscription and payment methods</p>
    </div>
    
    <!-- Current Plan -->
    <div class="card bg-base-100 shadow-xl mb-8">
      <div class="card-body">
        <h2 class="card-title">Current Plan</h2>
        <div class="flex items-center justify-between">
          <div>
            <span class="badge badge-lg {userProfile?.subscription_plan === 'pro' ? 'badge-primary' : userProfile?.subscription_plan === 'enterprise' ? 'badge-secondary' : 'badge-ghost'} capitalize">
              {userProfile?.subscription_plan || 'free'}
            </span>
            <p class="text-sm text-base-content/70 mt-2">
              {userProfile?.tokens_remaining || 1000} tokens remaining this month
            </p>
          </div>
          {#if userProfile?.subscription_plan !== 'free'}
            <button class="btn btn-outline btn-sm">Cancel Subscription</button>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Plan Selection -->
    {#if selectedPlan || userProfile?.subscription_plan === 'free'}
      <div class="card bg-base-100 shadow-xl mb-8">
        <div class="card-body">
          <h2 class="card-title">Select a Plan</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {#each Object.entries(plans) as [key, plan]}
              <div class="card bg-base-200 {selectedPlan === key ? 'ring-2 ring-primary' : ''}">
                <div class="card-body">
                  <h3 class="card-title">{plan.name}</h3>
                  <div class="text-3xl font-bold">${plan.price}<span class="text-base font-normal">/month</span></div>
                  <div class="text-sm text-base-content/70 mb-4">{plan.tokens.toLocaleString()} tokens/month</div>
                  
                  <ul class="space-y-2 mb-4">
                    {#each plan.features as feature}
                      <li class="flex items-center space-x-2">
                        <Check class="h-4 w-4 text-success" />
                        <span class="text-sm">{feature}</span>
                      </li>
                    {/each}
                  </ul>
                  
                  <button 
                    class="btn {selectedPlan === key ? 'btn-primary' : 'btn-outline'}"
                    on:click={() => selectedPlan = key}
                  >
                    {selectedPlan === key ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Payment Method Selection -->
    {#if selectedPlan}
      <div class="card bg-base-100 shadow-xl mb-8">
        <div class="card-body">
          <h2 class="card-title">Payment Method</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <label class="cursor-pointer">
              <input type="radio" bind:group={paymentMethod} value="stripe" class="radio radio-primary" />
              <div class="card bg-base-200 mt-2 {paymentMethod === 'stripe' ? 'ring-2 ring-primary' : ''}">
                <div class="card-body items-center text-center py-4">
                  <CreditCard class="h-8 w-8 mb-2" />
                  <span class="font-semibold">Credit Card</span>
                  <span class="text-xs text-base-content/70">via Stripe</span>
                </div>
              </div>
            </label>
            
            <label class="cursor-pointer">
              <input type="radio" bind:group={paymentMethod} value="paypal" class="radio radio-primary" />
              <div class="card bg-base-200 mt-2 {paymentMethod === 'paypal' ? 'ring-2 ring-primary' : ''}">
                <div class="card-body items-center text-center py-4">
                  <div class="text-2xl mb-2">💳</div>
                  <span class="font-semibold">PayPal</span>
                  <span class="text-xs text-base-content/70">Secure payments</span>
                </div>
              </div>
            </label>
            
            <label class="cursor-pointer">
              <input type="radio" bind:group={paymentMethod} value="tbc" class="radio radio-primary" />
              <div class="card bg-base-200 mt-2 {paymentMethod === 'tbc' ? 'ring-2 ring-primary' : ''} opacity-50">
                <div class="card-body items-center text-center py-4">
                  <div class="text-2xl mb-2">🏦</div>
                  <span class="font-semibold">TBC Bank</span>
                  <span class="text-xs text-base-content/70">Coming soon</span>
                </div>
              </div>
            </label>
            
            <label class="cursor-pointer">
              <input type="radio" bind:group={paymentMethod} value="bog" class="radio radio-primary" />
              <div class="card bg-base-200 mt-2 {paymentMethod === 'bog' ? 'ring-2 ring-primary' : ''} opacity-50">
                <div class="card-body items-center text-center py-4">
                  <div class="text-2xl mb-2">🏛️</div>
                  <span class="font-semibold">Bank of Georgia</span>
                  <span class="text-xs text-base-content/70">Coming soon</span>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Payment Summary -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Payment Summary</h2>
          
          {#if error}
            <div class="alert alert-error">
              <AlertCircle class="h-5 w-5" />
              <span>{error}</span>
            </div>
          {/if}
          
          {#if success}
            <div class="alert alert-success">
              <Check class="h-5 w-5" />
              <span>{success}</span>
            </div>
          {/if}
          
          <div class="flex justify-between items-center py-4 border-t">
            <div>
              <div class="font-semibold">{plans[selectedPlan].name} Plan</div>
              <div class="text-sm text-base-content/70">{plans[selectedPlan].tokens.toLocaleString()} tokens/month</div>
            </div>
            <div class="text-2xl font-bold">${plans[selectedPlan].price}/month</div>
          </div>
          
          <button 
            class="btn btn-primary btn-lg w-full"
            class:loading={processing}
            disabled={processing || !paymentMethod}
            on:click={handlePayment}
          >
            {processing ? 'Processing...' : `Subscribe for $${plans[selectedPlan].price}/month`}
          </button>
          
          <p class="text-xs text-base-content/70 text-center mt-4">
            By subscribing, you agree to our Terms of Service and Privacy Policy. 
            You can cancel anytime from your dashboard.
          </p>
        </div>
      </div>
    {/if}
  {/if}
</div>