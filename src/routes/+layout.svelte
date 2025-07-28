<script>
  import '../app.css'
  import Navbar from '$lib/components/Navbar.svelte'
  import { loading } from '$lib/stores/auth.js'
  
  let { children } = $props()
</script>

<div class="min-h-screen bg-base-200">
  <Navbar />
  
  {#if $loading}
    <div class="flex justify-center items-center min-h-[50vh]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <main>
      {@render children()}
    </main>
  {/if}
</div>