<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  hasUserLiked,
  getLikesCount,
  likePost,
  unlikePost,
  subscribeToLikes
} from '../services/likes.js'
import { getCurrentUser } from '../services/auth'
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

// Likes
const liked = ref(false)
const likes = ref(0)
const showComments = ref(false)
let stopLikes = null

// Edición
const currentUser = ref(getCurrentUser())
const isEditing = ref(false)
const editedContent = ref(props.post.content)

const isOwner = computed(() => {
  return currentUser.value && currentUser.value.id === props.post.user_id
})

const formattedDate = computed(() => {
  return new Date(props.post.created_at).toLocaleString()
})

// URL de la imagen 
const imageUrl = computed(() => {
  if (!props.post.file_path) return null
  return getFileURL(props.post.file_path, 'posts')
})

async function loadLikeState() {
  likes.value = await getLikesCount(props.post.id)
  liked.value = await hasUserLiked(props.post.id)
}

async function toggleLike() {
  const u = getCurrentUser()
  if (!u.id) return

  if (liked.value) {
    await unlikePost(props.post.id)
    liked.value = false
    likes.value = Math.max(0, likes.value - 1)
  } else {
    await likePost(props.post.id)
    liked.value = true
    likes.value += 1
  }
}

// edición
function startEdit() {
  isEditing.value = true
  editedContent.value = props.post.content
}

function cancelEdit() {
  isEditing.value = false
  editedContent.value = props.post.content
}

async function saveEdit() {
  try {
    const updated = await updatePost(props.post.id, editedContent.value)
    emit('updated', updated)
    isEditing.value = false
  } catch (err) {
    console.error('Error al actualizar post', err)
    alert('Hubo un error al guardar los cambios')
  }
}

async function removePost() {
  const ok = confirm('¿Seguro que querés eliminar esta publicación?')
  if (!ok) return

  try {
    await deletePost(props.post.id)
    emit('deleted', props.post.id)
  } catch (err) {
    console.error('Error al eliminar post', err)
    alert('Hubo un error al eliminar la publicación')
  }
}

onMounted(async () => {
  await loadLikeState()
  stopLikes = subscribeToLikes(
    (row) => {
      if (row.post_id === props.post.id) {
        likes.value += 1
      }
    },
    (row) => {
      if (row.post_id === props.post.id) {
        likes.value = Math.max(0, likes.value - 1)
      }
    }
  )
})

onUnmounted(() => {
  if (stopLikes) stopLikes()
})
</script>

<template>
  <article class="card">
    <!-- Usuario -->
    <p class="text-sm muted mb-2">
      <RouterLink :to="`/u/${post.user_id}`" class="hover:underline">
        @{{ post.user_profiles?.display_name || 'usuario' }}
      </RouterLink>
    </p>

    <!-- Contenido -->
    <div v-if="!isEditing">
      <p class="whitespace-pre-wrap text-[15px] leading-6">
        {{ post.content }}
      </p>
    </div>
    <div v-else class="mt-2">
      <textarea
        v-model="editedContent"
        class="w-full border rounded p-2"
        rows="3"
      ></textarea>
      <div class="flex justify-end gap-2 mt-2 text-xs">
        <button class="btn-ghost px-2 py-1" @click="cancelEdit">
          Cancelar
        </button>
        <button class="btn-primary px-2 py-1" @click="saveEdit">
          Guardar
        </button>
      </div>
    </div>

    <!-- Imagen adjunta -->
    <div v-if="imageUrl" class="mt-3">
      <img
        :src="imageUrl"
        alt="Archivo adjunto de la publicación"
        class="rounded-lg max-h-80 w-full object-cover"
      >
    </div>

    <!-- Fecha + acciones -->
    <div class="flex items-center justify-between mt-3 text-sm muted">
      <span>{{ formattedDate }}</span>
      <div class="flex items-center gap-2">
        <button class="btn-ghost px-3 py-1" @click="toggleLike">
          {{ liked ? '♥' : '♡' }} {{ likes }}
        </button>
        <button class="btn-ghost px-3 py-1" @click="showComments = !showComments">
          Comentarios
        </button>
      </div>
    </div>

    <!-- Botones -->
    <div v-if="isOwner" class="flex justify-end gap-2 mt-2 text-xs">
      <button class="btn-ghost px-2 py-1" @click="startEdit">
        Editar
      </button>
      <button class="btn-ghost px-2 py-1" @click="removePost">
        Eliminar
      </button>
    </div>

    <!-- Comentarios -->
    <div v-if="showComments" class="mt-3 grid gap-3">
      <CommentForm :postId="post.id" />
      <CommentList :postId="post.id" />
    </div>
  </article>
</template>
