<script>
  import { User, Bot } from 'lucide-svelte'
  
  export let message
  export let isUser = false
</script>

<div class="chat {isUser ? 'chat-end' : 'chat-start'}">
  <div class="chat-image avatar">
    <div class="w-10 rounded-full {isUser ? 'bg-primary' : 'bg-secondary'} text-white flex items-center justify-center">
      {#if isUser}
        <User class="h-5 w-5" />
      {:else}
        <Bot class="h-5 w-5" />
      {/if}
    </div>
  </div>
  <div class="chat-header">
    {isUser ? 'You' : 'AI Assistant'}
    <time class="text-xs opacity-50">{new Date().toLocaleTimeString()}</time>
  </div>
  <div class="chat-bubble {isUser ? 'chat-bubble-primary' : 'chat-bubble-secondary'} whitespace-pre-wrap">
    {message}
  </div>
</div>