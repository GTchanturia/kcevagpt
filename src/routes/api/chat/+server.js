import { json } from '@sveltejs/kit'
import { generateResponse } from '$lib/server/gemini.js'
import { supabaseAdmin } from '$lib/server/supabase.js'

export async function POST({ request, cookies }) {
  try {
    const { message, conversationHistory } = await request.json()
    
    // Get user from session
    const sessionCookie = cookies.get('sb-access-token')
    if (!sessionCookie) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify session and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(sessionCookie)
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user profile to check token limits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (profileError) {
      return json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }
    
    // Check if user has enough tokens
    if (profile.tokens_remaining <= 0) {
      return json({ error: 'Insufficient tokens. Please upgrade your plan.' }, { status: 403 })
    }
    
    // Generate AI response
    const { response, tokensUsed } = await generateResponse(message, conversationHistory)
    
    // Update user token usage
    const newTokensUsed = (profile.tokens_used || 0) + tokensUsed
    const newTokensRemaining = Math.max(0, profile.tokens_remaining - tokensUsed)
    
    await supabaseAdmin
      .from('user_profiles')
      .update({
        tokens_used: newTokensUsed,
        tokens_remaining: newTokensRemaining,
        total_messages: (profile.total_messages || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
    
    // Log the conversation
    await supabaseAdmin
      .from('chat_messages')
      .insert([
        {
          user_id: user.id,
          message: message,
          response: response,
          tokens_used: tokensUsed,
          created_at: new Date().toISOString()
        }
      ])
    
    return json({
      response,
      tokensUsed,
      tokensRemaining: newTokensRemaining
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}