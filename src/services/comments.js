import { supabase } from './supabase'


// Lista los comentarios de un post.

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


export async function addComment(postId, content) {
  const { data: session } = await supabase.auth.getUser()
  const u = session?.user
  if (!u?.id) throw new Error('No hay sesión')
  const text = String(content || '').trim()
  if (!text) throw new Error('Comentario vacío')
  const { error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, user_id: u.id, content: text })
  if (error) throw error
}


async function enrichComment(row) {
  if (!row?.user_id) return row
  const { data, error } = await supabase
    .from('user_profiles')
    .select('display_name, email')
    .eq('id', row.user_id)
    .maybeSingle()
  if (!error && data) {
    row.user_profiles = data
  }
  return row
}


export function subscribeToNewComments(postId, onInsert) {
  const channel = supabase
    .channel(`comments_post_${postId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'post_comments', filter: `post_id=eq.${postId}` },
      async payload => {
        const enriched = await enrichComment(payload.new)
        onInsert?.(enriched)
      }
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}
