<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { listComments, subscribeToNewComments, deleteComment } from '../services/comments.js'
import { subscribeToAuthState } from '../services/auth.js'

const props = defineProps({ 
  postId: { type: Number, required: true } 
})

const comments = ref([])
const currentUser = ref({ id: null, role: null })

// CAMBIO: Nombres más específicos para las suscripciones
let unsubscribeComments = null
let unsubscribeAuth = null

// CAMBIO: Nombre más descriptivo
async function loadComments() { 
  comments.value = await listComments(props.postId) 
}

async function handleDeleteComment(commentId) {
  const confirmDelete = confirm('¿Estás seguro de borrar este comentario?')
  if (!confirmDelete) return

  try {
    await deleteComment(commentId)
    // Actualización optimista de la UI
    comments.value = comments.value.filter(comment => comment.id !== commentId)
  } catch (error) {
    console.error('Error al borrar comentario', error)
    alert('No se pudo borrar el comentario')
  }
}

// CAMBIO: Funciones auxiliares para limpiar el Template
function getAuthorName(comment) {
  return comment.user_profiles?.display_name || 
         comment.user_profiles?.email?.split('@')[0] || 
         'Usuario'
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

onMounted(async () => {
  // 1. Obtener usuario actual
  unsubscribeAuth = subscribeToAuthState(user => {
    currentUser.value = user
  })

  // 2. Cargar comentarios iniciales
  await loadComments()
  
  // 3. Suscribirse a nuevos comentarios (CAMBIO: 'row' a 'newComment')
  unsubscribeComments = subscribeToNewComments(props.postId, (newComment) => {
    comments.value.push(newComment)
  })
})

onUnmounted(() => { 
  if (unsubscribeComments) unsubscribeComments() 
  if (unsubscribeAuth) unsubscribeAuth()
})

watch(() => props.postId, async () => {
  if (unsubscribeComments) unsubscribeComments()
  await loadComments()
  unsubscribeComments = subscribeToNewComments(props.postId, (newComment) => {
    comments.value.push(newComment)
  })
})
</script>

<template>
  <ul class="grid gap-2">
    <li 
      v-for="comment in comments" 
      :key="comment.id" 
      class="relative text-sm bg-gray-50 border rounded-xl px-3 py-2 pr-8"
    >
      
      <div>
        <span class="font-medium text-coffee-700">
          @{{ getAuthorName(comment) }}
        </span>
        <span class="text-gray-700"> — {{ comment.content }}</span>
      </div>
      
      <div class="text-xs text-gray-400 mt-1">
        {{ formatDate(comment.created_at) }}
      </div>

      <button 
        v-if="currentUser.id === comment.user_id || currentUser.role === 'admin'"
        @click="handleDeleteComment(comment.id)"
        class="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold px-2"
        title="Eliminar comentario"
      >
        &times;
      </button>

    </li>
  </ul>
</template>