<script>
  import { onMount } from 'svelte'
  import { user } from '$lib/stores/auth.js'
  import { messages, isLoading, addMessage, userTokens } from '$lib/stores/chat.js'
  import ChatMessage from '$lib/components/ChatMessage.svelte'
  import { Send, Zap } from 'lucide-svelte'
  import { goto } from '$app/navigation'
  
  let messageInput = ''
  let chatContainer
  let userProfile = null
  
  onMount(async () => {
    if (!$user) {
      goto('/auth/signin')
      return
    }
    
    // Fetch user profile and token info
    await fetchUserProfile()
  })
  
  async function fetchUserProfile() {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        userProfile = await response.json()
        userTokens.set(userProfile.tokens_remaining || 0)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }
  
  async function sendMessage() {
    if (!messageInput.trim() || $isLoading) return
    
    const userMessage = messageInput.trim()
    messageInput = ''
    
    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    })
    
    isLoading.set(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: $messages.slice(-10)
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send message')
      }
      
      const data = await response.json()
      
      // Add AI response
      addMessage({
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      })
      
      // Update token count
      userTokens.set(data.tokensRemaining)
      
    } catch (error) {
      console.error('Chat error:', error)
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      })
    } finally {
      isLoading.set(false)
    }
    
    // Scroll to bottom
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }, 100)
  }
  
  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }
</script>

<svelte:head>
  <title>Chat - AI Chat Pro</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">AI Chat</h1>
    <div class="flex items-center space-x-2 bg-base-100 rounded-lg px-4 py-2 shadow">
      <Zap class="h-5 w-5 text-warning" />
      <span class="font-semibold">{$userTokens} tokens</span>
    </div>
  </div>
  
  <!-- Chat Container -->
  <div class="card bg-base-100 shadow-xl h-[600px] flex flex-col">
    <!-- Messages -->
    <div 
      bind:this={chatContainer}
      class="flex-1 overflow-y-auto p-6 space-y-4"
    >
      {#if $messages.length === 0}
        <div class="text-center text-base-content/60 mt-20">
          <div class="text-6xl mb-4">🤖</div>
          <h3 class="text-xl font-semibold mb-2">Start a conversation</h3>
          <p>Ask me anything! I'm powered by Gemini 1.5 Pro and ready to help.</p>
        </div>
      {:else}
        {#each $messages as message}
          <ChatMessage 
            message={message.content} 
            isUser={message.role === 'user'} 
          />
        {/each}
      {/if}
      
      {#if $isLoading}
        <div class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full bg-secondary text-white flex items-center justify-center">
              <div class="loading loading-dots loading-sm"></div>
            </div>
          </div>
          <div class="chat-bubble chat-bubble-secondary">
            Thinking...
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Input -->
    <div class="border-t border-base-300 p-4">
      <div class="flex space-x-2">
        <textarea
          bind:value={messageInput}
          on:keypress={handleKeyPress}
          placeholder="Type your message here..."
          class="textarea textarea-bordered flex-1 resize-none"
          rows="1"
          disabled={$isLoading}
        ></textarea>
        <button
          on:click={sendMessage}
          disabled={!messageInput.trim() || $isLoading}
          class="btn btn-primary"
        >
          <Send class="h-5 w-5" />
        </button>
      </div>
      
      {#if $userTokens < 100}
        <div class="alert alert-warning mt-2">
          <span>You're running low on tokens. <a href="/pricing" class="link">Upgrade your plan</a> to continue chatting.</span>
        </div>
      {/if}
    </div>
  </div>
</div>