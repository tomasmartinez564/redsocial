import { supabase } from './supabase'
import { getCurrentUser } from './auth'

/**
 * Obtiene un perfil público por ID.
 */
export async function getProfileById(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, email, display_name, bio, cafe_favorito, avatar_path, updated_at')
    .eq('id', userId)
    .maybeSingle() // Retorna null si no existe, en vez de lanzar error

  if (error) throw error
  return data
}

/**
 * Obtiene el perfil del usuario autenticado actualmente.
 */
export async function getMyProfile() {
  const currentUser = getCurrentUser()
  if (!currentUser?.id) return null
  
  return getProfileById(currentUser.id)
}

/**
 * Crea el perfil inicial de un usuario (generalmente al registrarse).
 */
export async function createUserProfile(userId, email) {
  const { error } = await supabase
    .from('user_profiles')
    .insert({ id: userId, email })

  if (error) {
    // Advertencia no bloqueante, útil si ya existen triggers en la BD
    console.warn('[user-profiles] Aviso al crear perfil:', error.message)
  }
}

/**
 * Actualiza los datos del perfil del usuario logueado.
 * @param {Object} updates - Objeto con los campos a actualizar
 */
export async function updateMyProfile(updates) {
  const currentUser = getCurrentUser()
  if (!currentUser?.id) throw new Error('No hay sesión activa')

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', currentUser.id)
    .select()
    .single()

  if (error) throw error
  return data
}