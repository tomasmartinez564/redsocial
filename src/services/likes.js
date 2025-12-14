import { supabase } from './supabase'
import { getCurrentUser } from './auth'

// Devuelve si el usuario actual ya dio like a un post 
export async function hasUserLiked(postId) {
  const u = getCurrentUser()
  if (!u.id) return false
  const { data, error } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', u.id)
    .limit(1)
  if (error) throw error
  return (data?.length ?? 0) > 0
}


 // Lista los likes de un post.

export async function getLikesCount(postId) {
  const { count, error } = await supabase
    .from('post_likes')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId)
  if (error) throw error
  return count ?? 0
}

/**
 * Registra un like.
 * @param {string} postId
 * @returns {Promise<Object>}
 */
export async function likePost(postId) {
  const u = getCurrentUser()
  if (!u.id) throw new Error('No hay sesión')
  const { error } = await supabase.from('post_likes')
    .insert({ post_id: postId, user_id: u.id })
  if (error && !String(error.message).includes('duplicate')) throw error
}

/**
 * Quita un like propio.
 * @param {string} postId
 * @returns {Promise<void>}
 */
export async function unlikePost(postId) {
  const u = getCurrentUser()
  if (!u.id) throw new Error('No hay sesión')
  const { error } = await supabase.from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', u.id)
  if (error) throw error
}

/** Suscripcion en tiempo real a likes */
export function subscribeToLikes(onInsert, onDelete) {
  const channel = supabase
    .channel('likes_realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_likes' },
      payload => onInsert?.(payload.new))
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'post_likes' },
      payload => onDelete?.(payload.old))
    .subscribe()
  return () => supabase.removeChannel(channel)
}
