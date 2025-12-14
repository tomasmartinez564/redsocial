<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../services/supabase'
import { getCurrentUser } from '../services/auth'

const messages = ref([])
const newMessage = ref('')
let channel = null

async function loadMessages() {
  const { data } = await supabase.from('global_chat_messages')
    .select('*').order('created_at', { ascending: true })
  messages.value = data || []
}
async function sendMessage() {
  const u = getCurrentUser()
  const text = newMessage.value.trim()
  if (!u.id || !text) return
  await supabase.from('global_chat_messages').insert({ user_id: u.id, email: u.email, content: text })
  newMessage.value = ''
}

onMounted(() => {
  loadMessages()
  channel = supabase.channel('global_chat')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_chat_messages' },
      p => messages.value.push(p.new))
    .subscribe()
})
onUnmounted(() => { if (channel) supabase.removeChannel(channel) })
</script>

<template>
  <section class="container-page grid gap-4">
    <h2 class="text-2xl font-bold">Chat Global</h2>

    <div class="card h-[70vh] flex flex-col">
      <div class="flex-1 overflow-y-auto space-y-1 bg-cream-50 dark:bg-neutral-900 border border-coffee-200 dark:border-neutral-800 rounded-xl p-3 text-coffee-900 dark:text-neutral-100">
        <p v-for="m in messages" :key="m.id" class="text-sm">
          <span class="font-medium">{{ m.email }}:</span> {{ m.content }}
        </p>
      </div>

      <form @submit.prevent="sendMessage" class="flex gap-2 mt-3">
        <input v-model="newMessage" class="input" placeholder="Escribí un mensaje..." />
        <button class="btn-primary">Enviar</button>
      </form>
    </div>
  </section>
</template>
