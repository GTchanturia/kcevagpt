<script>
  import { onMount } from 'svelte'
  import { user } from '$lib/stores/auth.js'
  import { goto } from '$app/navigation'
  import AdminUserTable from '$lib/components/AdminUserTable.svelte'
  import { Users, DollarSign, MessageCircle, TrendingUp } from 'lucide-svelte'
  
  let loading = true
  let users = []
  let stats = {
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalMessages: 0
  }
  let selectedUser = null
  let showUserModal = false
  
  onMount(async () => {
    if (!$user) {
      goto('/auth/signin')
      return
    }
    
    // Check if user is admin
    await checkAdminAccess()
    await fetchAdminData()
  })
  
  async function checkAdminAccess() {
    try {
      const response = await fetch('/api/admin/check-access')
      if (!response.ok) {
        goto('/dashboard')
        return
      }
    } catch (error) {
      console.error('Admin access check failed:', error)
      goto('/dashboard')
    }
  }
  
  async function fetchAdminData() {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/stats')
      ])
      
      if (usersResponse.ok) {
        users = await usersResponse.json()
      }
      
      if (statsResponse.ok) {
        stats = await statsResponse.json()
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      loading = false
    }
  }
  
  function handleViewUser(user) {
    selectedUser = user
    showUserModal = true
  }
  
  async function handleEditUser(user) {
    // Implement user editing logic
    console.log('Edit user:', user)
  }
  
  async function handleDeleteUser(user) {
    if (confirm(`Are you sure you want to delete user ${user.email}?`)) {
      try {
        const response = await fetch(`/api/admin/users/${user.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          users = users.filter(u => u.id !== user.id)
          stats.totalUsers -= 1
        }
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }
</script>

<svelte:head>
  <title>Admin Dashboard - AI Chat Pro</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  {#if loading}
    <div class="flex justify-center items-center min-h-[50vh]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p class="text-base-content/70">Manage users, monitor usage, and view analytics</p>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="stat bg-base-100 shadow rounded-lg">
        <div class="stat-figure text-primary">
          <Users class="h-8 w-8" />
        </div>
        <div class="stat-title">Total Users</div>
        <div class="stat-value text-primary">{stats.totalUsers}</div>
        <div class="stat-desc">{stats.activeUsers} active this month</div>
      </div>
      
      <div class="stat bg-base-100 shadow rounded-lg">
        <div class="stat-figure text-secondary">
          <DollarSign class="h-8 w-8" />
        </div>
        <div class="stat-title">Revenue</div>
        <div class="stat-value text-secondary">${stats.totalRevenue}</div>
        <div class="stat-desc">Monthly recurring</div>
      </div>
      
      <div class="stat bg-base-100 shadow rounded-lg">
        <div class="stat-figure text-accent">
          <MessageCircle class="h-8 w-8" />
        </div>
        <div class="stat-title">Messages</div>
        <div class="stat-value text-accent">{stats.totalMessages.toLocaleString()}</div>
        <div class="stat-desc">Total conversations</div>
      </div>
      
      <div class="stat bg-base-100 shadow rounded-lg">
        <div class="stat-figure text-info">
          <TrendingUp class="h-8 w-8" />
        </div>
        <div class="stat-title">Growth</div>
        <div class="stat-value text-info">+12%</div>
        <div class="stat-desc">vs last month</div>
      </div>
    </div>
    
    <!-- Users Table -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">User Management</h2>
          <div class="flex space-x-2">
            <input type="text" placeholder="Search users..." class="input input-bordered input-sm" />
            <button class="btn btn-primary btn-sm">Export</button>
          </div>
        </div>
        
        <AdminUserTable 
          {users}
          onViewUser={handleViewUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />
      </div>
    </div>
  {/if}
</div>

<!-- User Details Modal -->
{#if showUserModal && selectedUser}
  <div class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4">User Details</h3>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">
            <span class="label-text">Full Name</span>
          </label>
          <input type="text" value={selectedUser.full_name || 'N/A'} class="input input-bordered w-full" readonly />
        </div>
        
        <div>
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input type="email" value={selectedUser.email} class="input input-bordered w-full" readonly />
        </div>
        
        <div>
          <label class="label">
            <span class="label-text">Subscription Plan</span>
          </label>
          <select class="select select-bordered w-full">
            <option selected={selectedUser.subscription_plan === 'free'}>free</option>
            <option selected={selectedUser.subscription_plan === 'pro'}>pro</option>
            <option selected={selectedUser.subscription_plan === 'enterprise'}>enterprise</option>
          </select>
        </div>
        
        <div>
          <label class="label">
            <span class="label-text">Status</span>
          </label>
          <select class="select select-bordered w-full">
            <option selected={selectedUser.is_active}>Active</option>
            <option selected={!selectedUser.is_active}>Inactive</option>
          </select>
        </div>
        
        <div>
          <label class="label">
            <span class="label-text">Tokens Used</span>
          </label>
          <input type="number" value={selectedUser.tokens_used || 0} class="input input-bordered w-full" />
        </div>
        
        <div>
          <label class="label">
            <span class="label-text">Token Limit</span>
          </label>
          <input type="number" value={selectedUser.token_limit || 1000} class="input input-bordered w-full" />
        </div>
      </div>
      
      <div class="modal-action">
        <button class="btn btn-primary">Save Changes</button>
        <button class="btn" on:click={() => showUserModal = false}>Close</button>
      </div>
    </div>
  </div>
{/if}