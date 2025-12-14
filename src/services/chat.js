import { supabase } from './supabase'

export async function getMessages() {
  const { data, error } = await supabase
    .from('global_chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function sendMessage(userId, email, content) {
  const { error } = await supabase
    .from('global_chat_messages')
    .insert({ 
      user_id: userId, 
      email: email, 
      content: content 
    })
  if (error) throw error
}

export function subscribeToChat(onNewMessage) {
  const channel = supabase.channel('global_chat')
    .on(
      'postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'global_chat_messages' },
      (payload) => {
        onNewMessage(payload.new)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}