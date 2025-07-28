<script>
  import { user, signOut } from '$lib/stores/auth.js'
  import { goto } from '$app/navigation'
  import { Menu, User, LogOut, Settings, CreditCard } from 'lucide-svelte'

  async function handleSignOut() {
    await signOut()
    goto('/')
  }
</script>

<div class="navbar bg-base-100 shadow-lg">
  <div class="navbar-start">
    <div class="dropdown">
      <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
        <Menu class="h-5 w-5" />
      </div>
      <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        <li><a href="/chat">Chat</a></li>
        <li><a href="/pricing">Pricing</a></li>
        {#if $user}
          <li><a href="/dashboard">Dashboard</a></li>
        {/if}
      </ul>
    </div>
    <a href="/" class="btn btn-ghost text-xl">AI Chat Pro</a>
  </div>
  
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      <li><a href="/chat" class="btn btn-ghost">Chat</a></li>
      <li><a href="/pricing" class="btn btn-ghost">Pricing</a></li>
      {#if $user}
        <li><a href="/dashboard" class="btn btn-ghost">Dashboard</a></li>
      {/if}
    </ul>
  </div>
  
  <div class="navbar-end">
    {#if $user}
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
            <User class="h-5 w-5" />
          </div>
        </div>
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li class="menu-title">
            <span>{$user.email}</span>
          </li>
          <li><a href="/dashboard"><Settings class="h-4 w-4" />Settings</a></li>
          <li><a href="/billing"><CreditCard class="h-4 w-4" />Billing</a></li>
          <li><button on:click={handleSignOut}><LogOut class="h-4 w-4" />Sign Out</button></li>
        </ul>
      </div>
    {:else}
      <div class="space-x-2">
        <a href="/auth/signin" class="btn btn-ghost">Sign In</a>
        <a href="/auth/signup" class="btn btn-primary">Sign Up</a>
      </div>
    {/if}
  </div>
</div>