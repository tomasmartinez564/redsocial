<script setup>
import { ref, watch } from 'vue'
import { getCurrentUser } from '../services/auth'
import { createPost } from '../services/posts.js'
import { uploadFile } from '../services/storage.js'

// CAMBIO: Nombres más explícitos para el estado
const postContent = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const selectedFile = ref(null)
const fileInputRef = ref(null)

// Limpiar error cuando el usuario escribe
watch(postContent, () => {
  if (errorMessage.value) errorMessage.value = ''
})

function handleFileChange(event) {
  // CAMBIO: 'f' a 'file'
  const file = event.target.files?.[0]
  selectedFile.value = file || null
}

// CAMBIO: Nombre más descriptivo
function generateUniqueFileName(userId, originalName) {
  const extension = originalName.includes('.') ? originalName.split('.').pop() : 'jpg'
  const randomString = Math.random().toString(36).slice(2)
  const timestamp = Date.now()
  return `${userId}/${timestamp}-${randomString}.${extension}`
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  
  // CAMBIO: 'u' a 'currentUser'
  const currentUser = getCurrentUser()
  // CAMBIO: 'text' a 'trimmedContent'
  const trimmedContent = postContent.value.trim()

  if (!currentUser.id) {
    errorMessage.value = 'Debes iniciar sesión para publicar.'
    return
  }
  
  if (!trimmedContent) {
    errorMessage.value = 'El contenido no puede estar vacío.'
    return
  }

  isLoading.value = true

  try {
    let filePath = null

    if (selectedFile.value) {
      const fileName = generateUniqueFileName(currentUser.id, selectedFile.value.name)
      await uploadFile(fileName, selectedFile.value, 'posts')
      filePath = fileName
    }

    await createPost({
      user_id: currentUser.id,
      content: trimmedContent,
      file_path: filePath
    })

    // Limpiar formulario
    postContent.value = ''
    selectedFile.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
    
    successMessage.value = '¡Publicación creada con éxito!'
    
    setTimeout(() => { successMessage.value = '' }, 3000)

  } catch (error) {
    console.error('Error al crear post', error)
    errorMessage.value = 'Ocurrió un error al intentar publicar.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form class="card grid gap-3" @submit.prevent="handleSubmit">
    
    <label for="post-content" class="sr-only">Contenido de la publicación</label>
    
    <textarea
      id="post-content"
      v-model="postContent"
      class="textarea w-full p-2 border rounded"
      :class="{ 'border-red-500 bg-red-50': errorMessage }"
      maxlength="500"
      placeholder="¿Qué estás pensando?"
      :disabled="isLoading"
    ></textarea>

    <div class="flex items-center gap-3 text-sm">
      <label for="post-image" class="sr-only">Subir imagen (opcional)</label>
      <input
        id="post-image"
        ref="fileInputRef"
        type="file"
        accept="image/*"
        @change="handleFileChange"
        :disabled="isLoading"
      />
      
      <span v-if="selectedFile" class="muted">
        Archivo: {{ selectedFile.name }}
      </span>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <button 
        class="btn-primary flex items-center gap-2" 
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
        {{ isLoading ? 'Publicando...' : 'Publicar' }}
      </button>

      <div class="flex-1 text-right">
        <p v-if="errorMessage" class="text-red-600 text-sm font-medium animate-pulse">
          {{ errorMessage }}
        </p>
        <p v-if="successMessage" class="text-green-600 text-sm font-medium">
          {{ successMessage }}
        </p>
      </div>
      
      <span class="muted text-xs">
        {{ postContent.length }}/500
      </span>
    </div>
  </form>
</template>