<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getProfileById } from '../services/user-profiles'
import { listUserPosts } from '../services/posts.js'
import { getFileURL } from '../services/storage.js' // Importamos esto
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const profile = ref(null)
const posts = ref([])
const loading = ref(true)
const errorMsg = ref('')

// Computed para obtener la URL del avatar
const avatarUrl = computed(() => {
  if (!profile.value?.avatar_path) return null
  return getFileURL(profile.value.avatar_path, 'avatars')
})

async function load(id) {
  loading.value = true
  errorMsg.value = ''
  try {
    // 1. Cargamos el perfil primero
    profile.value = await getProfileById(id)
    
    // 2. Despues cargamos los posts
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
  <section class="container-page grid gap-6">
    
    <div v-if="loading" class="text-center py-10">
      <span class="animate-pulse text-coffee-600 font-bold">Cargando perfil...</span>
    </div>
    <p v-else-if="errorMsg" class="text-red-500 text-center">{{ errorMsg }}</p>

    <div v-else-if="profile" class="card">
      <div class="flex flex-col items-center gap-4">
        
        <div class="w-24 h-24 rounded-full bg-coffee-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt="Foto de perfil"
            class="w-full h-full object-cover"
          >
          <span v-else class="text-3xl font-semibold text-coffee-700">
            {{ profile.display_name?.[0]?.toUpperCase() || '?' }}
          </span>
        </div>

        <div class="text-center">
          <h2 class="text-2xl font-bold text-coffee-800">
            {{ profile.display_name || 'Usuario sin nombre' }}
          </h2>
          <p class="text-gray-500 text-sm">{{ profile.email }}</p>
        </div>

        <div class="w-full bg-cream-50 dark:bg-neutral-800 rounded-lg p-4 grid gap-2 text-sm mt-2">
            <p>
                <span class="font-bold text-coffee-700">Bio:</span> 
                {{ profile.bio || 'Este usuario no ha escrito una biografía aún.' }}
            </p>
            <p>
                <span class="font-bold text-coffee-700">Café favorito:</span> 
                {{ profile.cafe_favorito || 'No especificado' }}
            </p>
        </div>
      </div>
    </div>

    <div class="grid gap-4">
      <h3 class="text-xl font-bold text-coffee-700 border-b pb-2">
        Publicaciones
      </h3>
      
      <div v-if="posts.length === 0" class="text-center py-8 text-gray-500 italic">
        Este usuario aún no ha publicado nada.
      </div>

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