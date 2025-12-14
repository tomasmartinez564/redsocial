<script setup>
import { ref } from 'vue'
import { addComment } from '../services/comments.js'

const props = defineProps({ postId: { type: Number, required: true } })
const text = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function submit() {
  errorMsg.value = ''
  const t = text.value.trim()
  if (!t) return
  loading.value = true
  try {
    await addComment(props.postId, t)
    text.value = ''
  } catch (e) {
    errorMsg.value = e?.message || 'No se pudo comentar'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="flex gap-2">
    <input v-model="text" class="flex-1 border rounded px-3 py-1" placeholder="Escribe un comentario…" />
    <button class="border rounded px-3 py-1" :disabled="loading">{{ loading ? 'Enviando…' : 'Comentar' }}</button>
  </form>
  <p v-if="errorMsg" class="text-red-600 text-sm mt-1">{{ errorMsg }}</p>
</template>
