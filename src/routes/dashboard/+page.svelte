<script>
  import { onMount } from 'svelte'
  import { user } from '$lib/stores/auth.js'
  import { goto } from '$app/navigation'
  import { MessageCircle, Zap, CreditCard, Settings, TrendingUp } from 'lucide-svelte'
  
  let userProfile = null
  let loading = true
  let stats = {
    totalMessages: 0,
    tokensUsed: 0,
    tokensRemaining: 0,
    currentPlan: 'free'
  }
  
  onMount(async () => {
    if (!$user) {
      goto('/auth/signin')
      return
    }
    
    await fetchUserData()
  })
  
  async function fetchUserData() {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        userProfile = await response.json()
        stats = {
          totalMessages: userProfile.total_messages || 0,
          tokensUsed: userProfile.tokens_used || 0,
          tokensRemaining: userProfile.tokens_remaining || 1000,
          currentPlan: userProfile.subscription_plan || 'free'
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      loading = false
    }
  }
  
  function getPlanBadgeClass(plan) {
    switch (plan) {
      case 'pro': return 'badge-primary'
      case 'enterprise': return 'badge-secondary'
      default: return 'badge-ghost'
    }
  }
  
  function getTokenLimit(plan) {
    switch (plan) {
      case 'pro': return 50000
      case 'enterprise': return 200000
      default: return 1000
    }
  }
</script>

<svelte:head>
  <title>Dashboard - AI Chat Pro</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  {#if loading}
    <div class="flex justify-center items-center min-h-[50vh]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Welcome back, {userProfile?.full_name || 'User'}!</h1>
      <p class="text-base-content/70">Here's your AI Chat Pro dashboard</p>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="stat bg-base-100 shadow rounded-lg">
        <div class="stat-figure text-primary">
          <MessageCircle class="h-8 w-8" />
        </div>
        <div class="stat-title">Total Messages</div>
        <div class="stat-value text-primary">{stats.totalMessages}</div>
        <div class="stat-desc">All time conversations</div>
      </div>
      
      <div class="stat bg-base-100 shadow rounded-lg">
        <div class="stat-figure text-secondary">
          <Zap class="h-8 w-8" />
        </div>
        <div class="stat-title">Tokens Used</div>
        <div class="stat-value text-secondary">{stats.tokensUsed.toLocaleString()}</div>
        <div class="stat-desc">This month</div>
      </div>
      
      <div class="stat bg-base-100 shadow rounded-lg">
        <div class="stat-figure text-accent">
          <TrendingUp class="h-8 w-8" />
        </div>
        <div class="stat-title">Tokens Remaining</div>
        <div class="stat-value text-accent">{stats.tokensRemaining.toLocaleString()}</div>
        <div class="stat-desc">Until next reset</div>
      </div>
      
      <div class="stat bg-base-100 shadow rounded-lg">
        <div class="stat-figure text-info">
          <CreditCard class="h-8 w-8" />
        </div>
        <div class="stat-title">Current Plan</div>
        <div class="stat-value">
          <span class="badge {getPlanBadgeClass(stats.currentPlan)} capitalize">
            {stats.currentPlan}
          </span>
        </div>
        <div class="stat-desc">
          <a href="/billing" class="link link-info">Manage billing</a>
        </div>
      </div>
    </div>
    
    <!-- Usage Progress -->
    <div class="card bg-base-100 shadow-xl mb-8">
      <div class="card-body">
        <h2 class="card-title">Token Usage This Month</h2>
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <progress 
              class="progress progress-primary w-full" 
              value={stats.tokensUsed} 
              max={getTokenLimit(stats.currentPlan)}
            ></progress>
          </div>
          <div class="text-sm text-base-content/70">
            {stats.tokensUsed.toLocaleString()} / {getTokenLimit(stats.currentPlan).toLocaleString()}
          </div>
        </div>
        
        {#if stats.tokensRemaining < getTokenLimit(stats.currentPlan) * 0.1}
          <div class="alert alert-warning mt-4">
            <span>You're running low on tokens. Consider <a href="/pricing" class="link">upgrading your plan</a>.</span>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">
            <MessageCircle class="h-6 w-6" />
            Start Chatting
          </h3>
          <p>Continue your AI conversations</p>
          <div class="card-actions justify-end">
            <a href="/chat" class="btn btn-primary">Open Chat</a>
          </div>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">
            <CreditCard class="h-6 w-6" />
            Manage Billing
          </h3>
          <p>Update your subscription and payment methods</p>
          <div class="card-actions justify-end">
            <a href="/billing" class="btn btn-outline">Billing</a>
          </div>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">
            <Settings class="h-6 w-6" />
            Account Settings
          </h3>
          <p>Update your profile and preferences</p>
          <div class="card-actions justify-end">
            <a href="/settings" class="btn btn-outline">Settings</a>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>