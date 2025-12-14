<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { listComments, subscribeToNewComments } from '../services/comments.js'

const props = defineProps({ postId: { type: Number, required: true } })
const comments = ref([])
let unsubscribe = null

async function load() { comments.value = await listComments(props.postId) }

onMounted(async () => {
  await load()
  unsubscribe = subscribeToNewComments(props.postId, (row) => comments.value.push(row))
})
onUnmounted(() => { unsubscribe?.() })

watch(() => props.postId, async () => {
  unsubscribe?.()
  await load()
  unsubscribe = subscribeToNewComments(props.postId, (row) => comments.value.push(row))
})
</script>

<template>
  <ul class="grid gap-2">
    <li v-for="c in comments" :key="c.id" class="text-sm bg-gray-50 border rounded-xl px-3 py-2">
      <span class="font-medium">
        @{{ c.user_profiles?.display_name || (c.user_profiles?.email || '').split('@')[0] || 'usuario' }}
      </span>
      — {{ c.content }}
      <span class="muted ml-2">
        {{ new Date(c.created_at).toLocaleString() }}
      </span>
    </li>
  </ul>
</template>
