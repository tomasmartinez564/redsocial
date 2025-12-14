
// Servicio para leer/actualizar perfiles de usuario

import { supabase } from './supabase'
import { getCurrentUser } from './auth'

// Obtiene un perfil por ID (UUID de auth.users).

export async function getProfileById(id) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, email, display_name, bio, cafe_favorito, avatar_path, updated_at')
    .eq('id', id)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

// Obtiene el perfil del usuario autenticado.

export async function getMyProfile() {
  const u = getCurrentUser()
  if (!u.id) return null
  return getProfileById(u.id)
}


// Actualiza el perfil del usuario logueado.

export async function updateMyProfile(patch) {
  const u = getCurrentUser()
  if (!u.id) throw new Error('No hay sesión')

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...patch,
      updated_at: new Date().toISOString()
    })
    .eq('id', u.id)
    .select('id, email, display_name, bio, cafe_favorito, avatar_path, updated_at')
    .maybeSingle()

  if (error) throw error
  return data
}
