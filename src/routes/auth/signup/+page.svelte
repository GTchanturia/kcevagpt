<script>
  import { signUp } from '$lib/stores/auth.js'
  import { goto } from '$app/navigation'
  import { Mail, Lock, User, Eye, EyeOff } from 'lucide-svelte'
  
  let email = ''
  let password = ''
  let fullName = ''
  let confirmPassword = ''
  let showPassword = false
  let showConfirmPassword = false
  let loading = false
  let error = ''
  
  async function handleSubmit() {
    if (!email || !password || !fullName || !confirmPassword) {
      error = 'Please fill in all fields'
      return
    }
    
    if (password !== confirmPassword) {
      error = 'Passwords do not match'
      return
    }
    
    if (password.length < 6) {
      error = 'Password must be at least 6 characters long'
      return
    }
    
    loading = true
    error = ''
    
    const { data, error: signUpError } = await signUp(email, password, fullName)
    
    if (signUpError) {
      error = signUpError
      loading = false
    } else {
      goto('/dashboard')
    }
  }
</script>

<svelte:head>
  <title>Sign Up - AI Chat Pro</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <h2 class="text-3xl font-bold">Create your account</h2>
      <p class="mt-2 text-base-content/60">
        Or <a href="/auth/signin" class="link link-primary">sign in to existing account</a>
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
            <label class="label" for="fullName">
              <span class="label-text">Full Name</span>
            </label>
            <div class="relative">
              <input
                id="fullName"
                type="text"
                bind:value={fullName}
                class="input input-bordered w-full pl-10"
                placeholder="Enter your full name"
                required
              />
              <User class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/40" />
            </div>
          </div>
          
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
            <label class="label" for="confirmPassword">
              <span class="label-text">Confirm Password</span>
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                bind:value={confirmPassword}
                class="input input-bordered w-full pl-10 pr-10"
                placeholder="Confirm your password"
                required
              />
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/40" />
              <button
                type="button"
                class="absolute right-3 top-1/2 transform -translate-y-1/2"
                on:click={() => showConfirmPassword = !showConfirmPassword}
              >
                {#if showConfirmPassword}
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>