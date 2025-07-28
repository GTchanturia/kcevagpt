<script>
  import { Check } from 'lucide-svelte'
  
  export let plan
  export let isPopular = false
  export let onSelect
</script>

<div class="card bg-base-100 shadow-xl {isPopular ? 'border-2 border-primary' : ''}">
  {#if isPopular}
    <div class="badge badge-primary absolute -top-2 left-1/2 transform -translate-x-1/2">
      Most Popular
    </div>
  {/if}
  
  <div class="card-body">
    <h2 class="card-title justify-center text-2xl">{plan.name}</h2>
    
    <div class="text-center py-4">
      <span class="text-4xl font-bold">${plan.price}</span>
      {#if plan.price > 0}
        <span class="text-base-content/60">/month</span>
      {/if}
    </div>
    
    <div class="text-center mb-4">
      <span class="text-lg font-semibold">{plan.tokens.toLocaleString()} tokens</span>
      <span class="text-base-content/60">/month</span>
    </div>
    
    <ul class="space-y-2 mb-6">
      {#each plan.features as feature}
        <li class="flex items-center space-x-2">
          <Check class="h-5 w-5 text-success" />
          <span>{feature}</span>
        </li>
      {/each}
    </ul>
    
    <div class="card-actions justify-center">
      <button 
        class="btn {isPopular ? 'btn-primary' : 'btn-outline'} btn-wide"
        on:click={() => onSelect(plan)}
      >
        {plan.price === 0 ? 'Get Started' : 'Subscribe'}
      </button>
    </div>
  </div>
</div>