import { supabase } from './supabase'

let user = { id: null, email: null }
const observers = new Set()

export function subscribeToAuthState(cb) {
  observers.add(cb)
  cb({ ...user })
  return () => observers.delete(cb)
}
function notifyAll() { for (const cb of observers) cb({ ...user }) }

export async function loadUserFromSupabase() {
  const { data, error } = await supabase.auth.getUser()
  if (error && error.message !== 'Auth session missing!') {
    console.error('[auth] getUser error:', error.message)
  }
  const sessionUser = data?.user || null
  user.id = sessionUser?.id ?? null
  user.email = sessionUser?.email ?? null
  notifyAll()
}

export async function register(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  await loadUserFromSupabase()
  return data
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  await loadUserFromSupabase()
  return data
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  await loadUserFromSupabase()
}

export async function changePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  return data
}

export function getCurrentUser() { return { ...user } }

supabase.auth.onAuthStateChange(() => { loadUserFromSupabase() })
