import { supabase } from './supabase'
import { getCurrentUser } from './auth'

/**
 * Verifica si el usuario actual ya dio like a un post.
 */
export async function hasUserLiked(postId) {
  const currentUser = getCurrentUser()
  if (!currentUser?.id) return false

  const { data, error } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', currentUser.id)
    .limit(1)

  if (error) throw error
  return (data?.length ?? 0) > 0
}

/**
 * Obtiene la cantidad total de likes de un post.
 */
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
 */
export async function likePost(postId) {
  const currentUser = getCurrentUser()
  if (!currentUser?.id) throw new Error('Debes iniciar sesión para dar like')

  const { error } = await supabase
    .from('post_likes')
    .insert({ 
      post_id: postId, 
      user_id: currentUser.id 
    })

  // Ignoramos error de duplicado (si el usuario hace doble clic rápido)
  if (error && !String(error.message).includes('duplicate')) {
    throw error
  }
}

/**
 * Quita un like propio.
 */
export async function unlikePost(postId) {
  const currentUser = getCurrentUser()
  if (!currentUser?.id) throw new Error('No hay sesión activa')

  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', currentUser.id)

  if (error) throw error
}

/** * Suscripción en tiempo real a cambios en los likes 
 */
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