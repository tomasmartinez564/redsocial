<script setup>
import { ref } from 'vue'
import { getCurrentUser } from '../services/auth'
import { createPost } from '../services/posts.js'
import { uploadFile } from '../services/storage.js'

const content = ref('')
const loading = ref(false)
const errorMsg = ref('')

const file = ref(null)
const fileInput = ref(null)

function handleFileChange(event) {
  const f = event.target.files?.[0]
  file.value = f || null
}

function generateFileName(userId, originalName) {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'jpg'
  const random = Math.random().toString(36).slice(2)
  const timestamp = Date.now()
  return `${userId}/${timestamp}-${random}.${ext}`
}

async function submit() {
  errorMsg.value = ''
  const u = getCurrentUser()
  const text = content.value.trim()

  if (!u.id) {
    errorMsg.value = 'Debes iniciar sesión.'
    return
  }
  if (!text) {
    errorMsg.value = 'Escribe algo.'
    return
  }

  loading.value = true

  try {
    let file_path = null

    if (file.value) {
      const filename = generateFileName(u.id, file.value.name)
      await uploadFile(filename, file.value, 'posts')
      file_path = filename
    }

    await createPost({
      user_id: u.id,
      content: text,
      file_path
    })

    // limpiar
    content.value = ''
    file.value = null
    if (fileInput.value) fileInput.value.value = ''
  } catch (err) {
    console.error('Error al crear post', err)
    errorMsg.value = 'Ocurrió un error al publicar.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="card grid gap-3" @submit.prevent="submit">
    <textarea
      v-model="content"
      class="textarea"
      maxlength="500"
      placeholder="¿Qué estás pensando?"
    />

    <div class="flex items-center gap-3 text-sm">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileChange"
      />
      <span v-if="file" class="muted">
        Archivo: {{ file.name }}
      </span>
    </div>

    <div class="flex items-center gap-3">
      <button class="btn-primary" :disabled="loading">
        {{ loading ? 'Publicando...' : 'Publicar' }}
      </button>
      <p v-if="errorMsg" class="text-red-600 text-sm" aria-live="polite">
        {{ errorMsg }}
      </p>
      <span class="muted text-xs ml-auto">
        {{ content.length }}/500
      </span>
    </div>
  </form>
</template>
