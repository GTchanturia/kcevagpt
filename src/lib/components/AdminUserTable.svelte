<script>
  import { onMount } from 'svelte'
  import { Eye, Edit, Trash2 } from 'lucide-svelte'
  
  export let users = []
  export let onViewUser
  export let onEditUser
  export let onDeleteUser
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString()
  }
  
  function getBadgeClass(plan) {
    switch (plan) {
      case 'pro': return 'badge-primary'
      case 'enterprise': return 'badge-secondary'
      default: return 'badge-ghost'
    }
  }
</script>

<div class="overflow-x-auto">
  <table class="table table-zebra">
    <thead>
      <tr>
        <th>User</th>
        <th>Plan</th>
        <th>Tokens Used</th>
        <th>Joined</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each users as user}
        <tr>
          <td>
            <div class="flex items-center space-x-3">
              <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content rounded-full w-12">
                  <span class="text-xs">{user.full_name?.charAt(0) || 'U'}</span>
                </div>
              </div>
              <div>
                <div class="font-bold">{user.full_name || 'Unknown'}</div>
                <div class="text-sm opacity-50">{user.email}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge {getBadgeClass(user.subscription_plan)} capitalize">
              {user.subscription_plan || 'free'}
            </span>
          </td>
          <td>
            <div class="text-sm">
              {user.tokens_used || 0} / {user.token_limit || 1000}
            </div>
            <progress 
              class="progress progress-primary w-20" 
              value={user.tokens_used || 0} 
              max={user.token_limit || 1000}
            ></progress>
          </td>
          <td>{formatDate(user.created_at)}</td>
          <td>
            <span class="badge {user.is_active ? 'badge-success' : 'badge-error'}">
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td>
            <div class="flex space-x-2">
              <button 
                class="btn btn-ghost btn-xs"
                on:click={() => onViewUser(user)}
              >
                <Eye class="h-4 w-4" />
              </button>
              <button 
                class="btn btn-ghost btn-xs"
                on:click={() => onEditUser(user)}
              >
                <Edit class="h-4 w-4" />
              </button>
              <button 
                class="btn btn-ghost btn-xs text-error"
                on:click={() => onDeleteUser(user)}
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>