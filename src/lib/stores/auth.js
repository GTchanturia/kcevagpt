import { writable } from 'svelte/store'
import { supabase } from '$lib/supabase.js'

export const user = writable(null)
export const loading = writable(true)

export async function signUp(email, password, fullName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.set(null)
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  user.set(session?.user ?? null)
  loading.set(false)
})