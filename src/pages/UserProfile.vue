<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProfileById } from '../services/user-profiles'
import { listUserPosts } from '../services/posts.js'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const profile = ref(null)
const posts = ref([])
const loading = ref(true)
const errorMsg = ref('')

async function load(id) {
  loading.value = true
  errorMsg.value = ''
  try {
    profile.value = await getProfileById(id)
    posts.value = await listUserPosts(id)
  } catch (err) {
    console.error(err)
    errorMsg.value = 'Error cargando perfil'
  } finally {
    loading.value = false
  }
}

function onPostDeleted(id) {
  posts.value = posts.value.filter(p => p.id !== id)
}

function onPostUpdated(updated) {
  posts.value = posts.value.map(p =>
    p.id === updated.id ? { ...p, ...updated } : p
  )
}

onMounted(() => {
  load(route.params.id)
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId) load(newId)
  }
)
</script>

<template>
  <section class="container-page grid gap-4">
    <h2 class="text-2xl font-bold">
      Perfil público
    </h2>

    <p v-if="loading">Cargando…</p>
    <p v-else-if="errorMsg" class="text-red-500">{{ errorMsg }}</p>

    <div v-if="profile" class="card grid gap-2">
      <div class="text-center">
        <p class="text-xl font-semibold">{{ profile.display_name || '—' }}</p>
        <p class="muted">{{ profile.email }}</p>
      </div>
      <div><span class="font-semibold">Bio:</span> {{ profile.bio || '—' }}</div>
      <div><span class="font-semibold">Cafe favorito:</span> {{ profile.cafe_favorito || '—' }}</div>
    </div>

    <div class="grid gap-3">
      <PostCard
        v-for="p in posts"
        :key="p.id"
        :post="p"
        @deleted="onPostDeleted"
        @updated="onPostUpdated"
      />
    </div>
  </section>
</template>
