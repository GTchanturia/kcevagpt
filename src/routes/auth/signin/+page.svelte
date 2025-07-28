<script>
  import { signIn } from '$lib/stores/auth.js'
  import { goto } from '$app/navigation'
  import { Mail, Lock, Eye, EyeOff } from 'lucide-svelte'
  
  let email = ''
  let password = ''
  let showPassword = false
  let loading = false
  let error = ''
  
  async function handleSubmit() {
    if (!email || !password) {
      error = 'Please fill in all fields'
      return
    }
    
    loading = true
    error = ''
    
    const { data, error: signInError } = await signIn(email, password)
    
    if (signInError) {
      error = signInError
      loading = false
    } else {
      goto('/dashboard')
    }
  }
</script>

<svelte:head>
  <title>Sign In - AI Chat Pro</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <h2 class="text-3xl font-bold">Sign in to your account</h2>
      <p class="mt-2 text-base-content/60">
        Or <a href="/auth/signup" class="link link-primary">create a new account</a>
      </p>
    </div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          {#if error}
            <div class="alert alert-error">
              <span>{error}</span>
            </div>
          {/if}
          
          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text">Email address</span>
            </label>
            <div class="relative">
              <input
                id="email"
                type="email"
                bind:value={email}
                class="input input-bordered w-full pl-10"
                placeholder="Enter your email"
                required
              />
              <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/40" />
            </div>
          </div>
          
          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">Password</span>
            </label>
            <div class="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                bind:value={password}
                class="input input-bordered w-full pl-10 pr-10"
                placeholder="Enter your password"
                required
              />
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/40" />
              <button
                type="button"
                class="absolute right-3 top-1/2 transform -translate-y-1/2"
                on:click={() => showPassword = !showPassword}
              >
                {#if showPassword}
                  <EyeOff class="h-5 w-5 text-base-content/40" />
                {:else}
                  <Eye class="h-5 w-5 text-base-content/40" />
                {/if}
              </button>
            </div>
          </div>
          
          <div class="form-control">
            <button
              type="submit"
              class="btn btn-primary w-full"
              class:loading
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div class="text-center mt-4">
          <a href="/auth/forgot-password" class="link link-primary text-sm">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  </div>
</div>