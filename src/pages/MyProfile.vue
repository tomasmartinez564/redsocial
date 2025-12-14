<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMyProfile } from '../services/user-profiles'
import { getFileURL } from '../services/storage'

const profile = ref(null)
const loading = ref(true)
const errorMsg = ref('')

const avatarUrl = computed(() => {
  if (!profile.value?.avatar_path) return null
  return getFileURL(profile.value.avatar_path, 'avatars')
})

onMounted(async () => {
  loading.value = true
  try {
    profile.value = await getMyProfile()
  } catch (err) {
    console.error(err)
    errorMsg.value = 'Ocurrió un error al cargar tu perfil.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="container-page grid gap-4">
    <h2 class="text-2xl font-bold text-center">Mi Perfil</h2>

    <p v-if="loading">Cargando…</p>
    <p v-else-if="errorMsg" class="text-red-500 text-center">{{ errorMsg }}</p>

    <div v-else-if="profile" class="card grid gap-4 max-w-xl mx-auto">
      <div class="flex flex-col items-center gap-3">
        <div class="w-24 h-24 rounded-full bg-coffee-100 flex items-center justify-center overflow-hidden">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt="Foto de perfil"
            class="w-full h-full object-cover"
          >
          <span v-else class="text-3xl font-semibold">
            {{ profile.display_name?.[0]?.toUpperCase() || '?' }}
          </span>
        </div>
        <div class="text-center">
          <p class="text-lg font-semibold">{{ profile.display_name || 'Sin nombre' }}</p>
          <p class="muted text-sm">{{ profile.email }}</p>
        </div>
      </div>

      <div class="grid gap-2 text-sm">
        <p><span class="font-semibold">Bio:</span> {{ profile.bio || '—' }}</p>
        <p><span class="font-semibold">Café favorito:</span> {{ profile.cafe_favorito || '—' }}</p>
      </div>

      <RouterLink
        to="/profile/edit"
        class="btn-primary justify-center"
      >
        Editar perfil
      </RouterLink>

      <RouterLink
        to="/profile/change-password"
        class="btn-ghost justify-center text-sm"
      >
        Cambiar contraseña
      </RouterLink>
    </div>
  </section>
</template>
