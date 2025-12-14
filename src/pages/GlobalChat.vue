<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { getCurrentUser } from '../services/auth'
import { getMessages, sendMessage, subscribeToChat } from '../services/chat.js'

const messages = ref([])
const newMessage = ref('')
const loading = ref(false)
const chatContainer = ref(null) 
let unsubscribe = null

// Función para bajar el scroll al final
async function scrollToBottom() {
  await nextTick() 
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

async function load() {
  loading.value = true
  try {
    messages.value = await getMessages()
    await scrollToBottom()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleSend() {
  const u = getCurrentUser()
  const text = newMessage.value.trim()
  
  if (!u.id || !text) return

  try {
    await sendMessage(u.id, u.email, text)
    newMessage.value = ''
  } catch (e) {
    console.error('Error enviando mensaje', e)
  }
}

onMounted(() => {
  load()
  
  unsubscribe = subscribeToChat(async (newMsg) => {
    messages.value.push(newMsg)
    await scrollToBottom()
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <section class="container-page grid gap-4 h-[85vh]">
    <h1 class="text-3xl font-bold text-coffee-700">Chat Global</h1>

    <div class="card flex flex-col h-full overflow-hidden">
      
      <div 
        ref="chatContainer" 
        class="flex-1 overflow-y-auto space-y-2 bg-cream-50 dark:bg-neutral-900 border border-coffee-200 rounded-xl p-4"
      >
        <div v-if="loading" class="text-center text-gray-400 mt-4">Cargando mensajes...</div>
        
        <div v-else v-for="m in messages" :key="m.id" class="text-sm">
          <span class="font-bold text-coffee-600 block sm:inline">
            {{ m.email.split('@')[0] }}:
          </span> 
          <span class="text-gray-800 dark:text-gray-200">
            {{ m.content }}
          </span>
        </div>
      </div>

      <form @submit.prevent="handleSend" class="flex gap-2 mt-3 pt-2 border-t">
        <label for="chat-input" class="sr-only">Escribe tu mensaje</label>
        
        <input 
          id="chat-input" 
          v-model="newMessage" 
          class="input flex-1" 
          placeholder="Escribí un mensaje..." 
        />
        <button class="btn-primary" :disabled="!newMessage.trim()">
          Enviar
        </button>
      </form>
    </div>
  </section>
</template>