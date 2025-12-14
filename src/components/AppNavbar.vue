<script setup>
import { RouterLink } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import { subscribeToAuthState, logout } from '../services/auth'

const user = ref({ id: null, email: null })
let unsub

onMounted(() => { unsub = subscribeToAuthState(u => user.value = u) })
onUnmounted(() => { unsub?.() })

async function handleLogout() { await logout() }


const isDark = ref(false)
onMounted(() => {
  isDark.value = localStorage.getItem('theme') === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
})
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>

<template>
  <nav class="sticky top-0 z-10 h-[60px] border-b border-coffee-200 dark:border-neutral-800 bg-cream-50/70 dark:bg-neutral-950/70 backdrop-blur
              flex items-center px-4 sm:px-6 justify-between">
    <RouterLink to="/" class="font-semibold text-transparent bg-clip-text
                              bg-gradient-to-r from-coffee-700 to-coffee-500">
      Coffee App
    </RouterLink>

    <div class="flex items-center gap-2">
      <RouterLink to="/" class="nav-link">Inicio</RouterLink>
      <RouterLink to="/feed" class="nav-link">Feed</RouterLink>
      <RouterLink to="/chat" class="nav-link">Chat</RouterLink>



      <template v-if="!user.id">
        <RouterLink to="/login" class="btn-outline">Login</RouterLink>
        <RouterLink to="/register" class="btn-primary">Registro</RouterLink>
      </template>
      <template v-else>
        <RouterLink to="/profile" class="btn-outline">Mi Perfil</RouterLink>
        <button @click="handleLogout" class="btn-ghost">
          Cerrar sesión ({{ user.email }})
        </button>
      </template>
    </div>
  </nav>
</template>
