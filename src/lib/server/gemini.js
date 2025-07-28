import { GoogleGenerativeAI } from '@google/generative-ai'
import { GOOGLE_GENERATIVE_AI_API_KEY } from '$env/static/private'

const genAI = new GoogleGenerativeAI(GOOGLE_GENERATIVE_AI_API_KEY)

export async function generateResponse(prompt, conversationHistory = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    // Build conversation context
    let context = ''
    if (conversationHistory.length > 0) {
      context = conversationHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')
      context += '\n'
    }
    
    const fullPrompt = context + `User: ${prompt}`
    
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()
    
    // Estimate token usage (rough approximation)
    const tokenCount = Math.ceil((fullPrompt.length + text.length) / 4)
    
    return {
      response: text,
      tokensUsed: tokenCount
    }
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw new Error('Failed to generate AI response')
  }
}