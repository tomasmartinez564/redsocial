import { supabase } from './supabase'


// Trae los últimos posts con datos del usuario.
export async function listLatestPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      user_id,
      content,
      file_path,
      created_at,
      user_profiles (display_name)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}


//Crea una nueva publicación.
export async function createPost({ user_id, content, file_path = null }) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id, content, file_path })
    .select(`
      id,
      user_id,
      content,
      file_path,
      created_at,
      user_profiles (display_name)
    `)
    .single()

  if (error) throw error
  return data
}


// Actualiza un post propio.

export async function updatePost(id, content) {
  const { data, error } = await supabase
    .from('posts')
    .update({ content })
    .eq('id', id)
    .select(`
      id,
      user_id,
      content,
      file_path,
      created_at,
      user_profiles (display_name)
    `)

  if (error) {
    console.error('[updatePost] error:', error)
    throw error
  }

  return data?.[0]
}


// Borra un post propio.
export async function deletePost(id) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deletePost] error:', error)
    throw error
  }
}


// Suscripción en tiempo real a nuevos posts.

export function subscribeToNewPosts(onInsert) {
  const channel = supabase
    .channel('posts_feed')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'posts'
    }, payload => onInsert?.(payload.new))
    .subscribe()

  return () => supabase.removeChannel(channel)
}


// Posts de un usuario (perfil público).

export async function listUserPosts(userId, limit = 50) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      user_id,
      content,
      file_path,
      created_at,
      user_profiles (display_name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}
