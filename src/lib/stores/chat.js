import { writable } from 'svelte/store'

export const messages = writable([])
export const isLoading = writable(false)
export const userTokens = writable(0)

export function addMessage(message) {
  messages.update(msgs => [...msgs, message])
}

export function clearMessages() {
  messages.set([])
}

export function updateTokens(tokens) {
  userTokens.set(tokens)
}