import { supabase } from './supabase'

/**
 * Lista los comentarios de un post.
 */
export async function listComments(postId, limit = 50) {
  const { data, error } = await supabase
    .from('post_comments')
    .select(`
      id,
      post_id,
      user_id,
      content,
      created_at,
      user_profiles ( display_name, email )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

/**
 * Agrega un nuevo comentario.
 */
export async function addComment(postId, content) {
  // Obtenemos la sesión directamente de Supabase para asegurar autenticidad
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.id) throw new Error('Usuario no autenticado para comentar')

  const commentText = String(content || '').trim()
  if (!commentText) throw new Error('El comentario no puede estar vacío')

  const { error } = await supabase
    .from('post_comments')
    .insert({ 
      post_id: postId, 
      user_id: user.id, 
      content: commentText 
    })

  if (error) throw error
}

/**
 * Helper interno para enriquecer comentarios en tiempo real con datos del perfil.
 */
async function enrichComment(commentRow) {
  if (!commentRow?.user_id) return commentRow

  const { data, error } = await supabase
    .from('user_profiles')
    .select('display_name, email')
    .eq('id', commentRow.user_id)
    .maybeSingle()

  if (!error && data) {
    commentRow.user_profiles = data
  }
  return commentRow
}

export function subscribeToNewComments(postId, onInsert) {
  const channel = supabase
    .channel(`comments_post_${postId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'post_comments', filter: `post_id=eq.${postId}` },
      async payload => {
        // Enriquecemos el comentario nuevo con el perfil antes de enviarlo a la UI
        const enrichedComment = await enrichComment(payload.new)
        onInsert?.(enrichedComment)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export async function deleteComment(commentId) {
  const { error } = await supabase
    .from('post_comments')
    .delete()
    .eq('id', commentId)
  
  if (error) throw error
}