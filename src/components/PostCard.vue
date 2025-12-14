<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  hasUserLiked,
  getLikesCount,
  likePost,
  unlikePost,
  subscribeToLikes
} from '../services/likes.js'
import { subscribeToAuthState } from '../services/auth'
import { updatePost, deletePost } from '../services/posts.js'
import { getFileURL } from '../services/storage.js'
import CommentForm from './CommentForm.vue'
import CommentList from './CommentList.vue'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['deleted', 'updated'])

// Estados locales
const isLiked = ref(false) // CAMBIO: 'liked' a 'isLiked'
const likeCount = ref(0)   // CAMBIO: 'likes' a 'likeCount'
const showComments = ref(false)
let unsubscribeLikes = null // CAMBIO: 'stopLikes' a 'unsubscribeLikes'

// Usuario actual
const currentUser = ref({ id: null, role: null })
let unsubscribeAuth = null

// Edición
const isEditing = ref(false)
const editedContent = ref(props.post.content)

// Permisos
const canEditOrDelete = computed(() => {
  if (!currentUser.value.id) return false
  const isOwner = currentUser.value.id === props.post.user_id
  const isAdmin = currentUser.value.role === 'admin'
  return isOwner || isAdmin
})

const formattedDate = computed(() => {
  return new Date(props.post.created_at).toLocaleString()
})

const imageUrl = computed(() => {
  if (!props.post.file_path) return null
  return getFileURL(props.post.file_path, 'posts')
})

async function loadLikeState() {
  likeCount.value = await getLikesCount(props.post.id)
  isLiked.value = await hasUserLiked(props.post.id)
}

async function handleToggleLike() {
  if (!currentUser.value.id) return // Opcional: Mostrar alerta de login

  try {
    if (isLiked.value) {
      await unlikePost(props.post.id)
      isLiked.value = false
      likeCount.value = Math.max(0, likeCount.value - 1)
    } else {
      await likePost(props.post.id)
      isLiked.value = true
      likeCount.value += 1
    }
  } catch (error) {
    console.error('Error al cambiar like', error)
  }
}

// Edición
function startEdit() {
  isEditing.value = true
  editedContent.value = props.post.content
}

function cancelEdit() {
  isEditing.value = false
  editedContent.value = props.post.content
}

async function handleSaveEdit() {
  try {
    const updated = await updatePost(props.post.id, editedContent.value)
    emit('updated', updated)
    isEditing.value = false
  } catch (err) {
    console.error('Error al actualizar post', err)
    alert('Hubo un error al guardar los cambios')
  }
}

async function handleDeletePost() {
  const confirmDelete = confirm('¿Seguro que querés eliminar esta publicación?')
  if (!confirmDelete) return

  try {
    await deletePost(props.post.id)
    emit('deleted', props.post.id)
  } catch (err) {
    console.error('Error al eliminar post', err)
    alert('Hubo un error al eliminar la publicación')
  }
}

onMounted(async () => {
  unsubscribeAuth = subscribeToAuthState(newUser => {
    currentUser.value = newUser
  })

  await loadLikeState()
  
  // Suscripción a likes en tiempo real
  unsubscribeLikes = subscribeToLikes(
    (newLike) => {
      if (newLike.post_id === props.post.id) {
        likeCount.value += 1
      }
    },
    (deletedLike) => {
      if (deletedLike.post_id === props.post.id) {
        likeCount.value = Math.max(0, likeCount.value - 1)
      }
    }
  )
})

onUnmounted(() => {
  if (unsubscribeLikes) unsubscribeLikes()
  if (unsubscribeAuth) unsubscribeAuth()
})
</script>

<template>
  <article class="card">
    <p class="text-sm muted mb-2">
      <RouterLink :to="`/u/${post.user_id}`" class="hover:underline font-medium text-coffee-700">
        @{{ post.user_profiles?.display_name || 'usuario' }}
      </RouterLink>
    </p>

    <div v-if="!isEditing">
      <p class="whitespace-pre-wrap text-[15px] leading-6">
        {{ post.content }}
      </p>
    </div>
    
    <div v-else class="mt-2">
      <label :for="`edit-content-${post.id}`" class="sr-only">Editar contenido</label>
      
      <textarea
        :id="`edit-content-${post.id}`"
        v-model="editedContent"
        class="w-full border rounded p-2 focus:ring-2 focus:ring-coffee-500 outline-none"
        rows="3"
      ></textarea>
      
      <div class="flex justify-end gap-2 mt-2 text-xs">
        <button class="btn-ghost px-2 py-1" @click="cancelEdit">
          Cancelar
        </button>
        <button class="btn-primary px-2 py-1" @click="handleSaveEdit">
          Guardar
        </button>
      </div>
    </div>

    <div v-if="imageUrl" class="mt-3">
      <img
        :src="imageUrl"
        alt="Archivo adjunto de la publicación"
        class="rounded-lg max-h-80 w-full object-cover shadow-sm"
      >
    </div>

    <div class="flex items-center justify-between mt-3 text-sm muted">
      <span>{{ formattedDate }}</span>
      <div class="flex items-center gap-2">
        
        <button 
          class="btn-ghost px-3 py-1 flex items-center gap-1 transition-colors" 
          :class="{ 'text-red-500': isLiked }"
          @click="handleToggleLike"
          :aria-label="isLiked ? 'Quitar Me gusta' : 'Me gusta'"
        >
          <span class="text-lg leading-none">{{ isLiked ? '♥' : '♡' }}</span> 
          <span>{{ likeCount }}</span>
        </button>
        
        <button class="btn-ghost px-3 py-1" @click="showComments = !showComments">
          Comentarios
        </button>
      </div>
    </div>

    <div v-if="canEditOrDelete" class="flex justify-end gap-2 mt-2 text-xs border-t border-gray-100 pt-2">
      <button class="btn-ghost px-2 py-1 text-blue-600 hover:bg-blue-50" @click="startEdit">
        Editar
      </button>
      <button class="btn-ghost px-2 py-1 text-red-600 hover:bg-red-50" @click="handleDeletePost">
        Eliminar
      </button>
    </div>

    <div v-if="showComments" class="mt-3 grid gap-3 border-t border-gray-100 pt-3">
      <CommentForm :postId="post.id" />
      <CommentList :postId="post.id" />
    </div>
  </article>
</template>