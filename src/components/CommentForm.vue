<script setup>
import { ref } from 'vue'
import { addComment } from '../services/comments.js'

const props = defineProps({ 
  postId: { type: Number, required: true } 
})

// CAMBIO: Nombres más descriptivos
const commentContent = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  
  // CAMBIO: Evitamos la variable 't'
  const trimmedContent = commentContent.value.trim()
  
  if (!trimmedContent) {
    errorMessage.value = 'Escribe algo para comentar.'
    return
  }

  loading.value = true
  try {
    await addComment(props.postId, trimmedContent)
    commentContent.value = '' // Limpiamos el input
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Error al enviar el comentario.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mb-4">
    <form @submit.prevent="handleSubmit" class="flex gap-2 items-start">
      
      <label :for="`comment-input-${postId}`" class="sr-only">Escribe un comentario</label>

      <input 
        :id="`comment-input-${postId}`"
        v-model="commentContent" 
        class="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-coffee-500"
        :class="{ 'border-red-500 bg-red-50': errorMessage }"
        placeholder="Escribe un comentario..." 
        :disabled="loading"
        @input="errorMessage = ''" 
      />
      
      <button 
        class="btn-primary text-xs px-3 py-2 h-full" 
        :disabled="loading"
      >
        {{ loading ? '...' : 'Enviar' }}
      </button>
    </form>
    
    <p v-if="errorMessage" class="text-red-500 text-xs mt-1 ml-1 font-medium">
      {{ errorMessage }}
    </p>
  </div>
</template>