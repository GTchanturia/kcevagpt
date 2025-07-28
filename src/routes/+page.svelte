<script>
  import { MessageCircle, Zap, Shield, Users } from 'lucide-svelte'
</script>

<svelte:head>
  <title>AI Chat Pro - Advanced AI Conversations</title>
  <meta name="description" content="Experience the future of AI conversations with our advanced chat platform powered by Gemini 1.5 Pro." />
</svelte:head>

<!-- Hero Section -->
<div class="hero min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold">AI Chat Pro</h1>
      <p class="py-6">
        Experience the future of AI conversations with our advanced chat platform powered by Gemini 1.5 Pro. 
        Get intelligent responses, creative assistance, and professional support.
      </p>
      <div class="space-x-4">
        <a href="/chat" class="btn btn-primary btn-lg">Start Chatting</a>
        <a href="/pricing" class="btn btn-outline btn-lg">View Pricing</a>
      </div>
    </div>
  </div>
</div>

<!-- Features Section -->
<div class="py-20 bg-base-100">
  <div class="container mx-auto px-4">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold mb-4">Why Choose AI Chat Pro?</h2>
      <p class="text-xl text-base-content/70">Powerful features designed for modern AI interactions</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body items-center text-center">
          <MessageCircle class="h-12 w-12 text-primary mb-4" />
          <h3 class="card-title">Advanced AI</h3>
          <p>Powered by Google's Gemini 1.5 Pro for intelligent conversations</p>
        </div>
      </div>
      
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body items-center text-center">
          <Zap class="h-12 w-12 text-secondary mb-4" />
          <h3 class="card-title">Lightning Fast</h3>
          <p>Get instant responses with our optimized infrastructure</p>
        </div>
      </div>
      
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body items-center text-center">
          <Shield class="h-12 w-12 text-accent mb-4" />
          <h3 class="card-title">Secure & Private</h3>
          <p>Your conversations are encrypted and never stored permanently</p>
        </div>
      </div>
      
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body items-center text-center">
          <Users class="h-12 w-12 text-info mb-4" />
          <h3 class="card-title">Multi-User</h3>
          <p>Perfect for teams and individual users alike</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- CTA Section -->
<div class="py-20 bg-primary text-primary-content">
  <div class="container mx-auto px-4 text-center">
    <h2 class="text-4xl font-bold mb-4">Ready to Get Started?</h2>
    <p class="text-xl mb-8">Join thousands of users already using AI Chat Pro</p>
    <div class="space-x-4">
      <a href="/auth/signup" class="btn btn-secondary btn-lg">Sign Up Free</a>
      <a href="/pricing" class="btn btn-outline btn-lg">View Plans</a>
    </div>
  </div>
</div>