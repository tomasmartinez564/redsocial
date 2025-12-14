<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
// Asegúrate de que services/auth exporte estas funciones
import { subscribeToAuthState, logout } from '../services/auth'

const router = useRouter()

// CAMBIO: Renombramos 'user' a 'currentUser' para ser más explícitos
const currentUser = ref({ id: null, email: null })

// CAMBIO: 'unsub' a 'unsubscribe'
let unsubscribe

onMounted(() => { 
  // CAMBIO: 'u' a 'userData'
  unsubscribe = subscribeToAuthState(userData => {
    currentUser.value = userData
  }) 
})

onUnmounted(() => { 
  if (unsubscribe) unsubscribe()
})

async function handleLogout() {
  await logout()
  router.push('/feed')
}

// Lógica de tema oscuro
const isDark = ref(false)
onMounted(() => {
  isDark.value = localStorage.getItem('theme') === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>

<template>
  <nav class="sticky top-0 z-10 h-[60px] border-b border-coffee-200 dark:border-neutral-800 bg-cream-50/70 dark:bg-neutral-950/70 backdrop-blur flex items-center px-4 sm:px-6 justify-between">
    
    <RouterLink to="/" class="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-coffee-700 to-coffee-500 hover:opacity-80 transition-opacity">
      Coffee App
    </RouterLink>

    <div class="flex items-center gap-2 sm:gap-4 text-sm font-medium">
      <RouterLink to="/" class="nav-link hidden sm:block">Inicio</RouterLink>
      <RouterLink to="/feed" class="nav-link">Muro</RouterLink>
      <RouterLink to="/chat" class="nav-link">Chat Global</RouterLink>

      <template v-if="!currentUser.id">
        <RouterLink to="/login" class="btn-outline px-3 py-1">
          Ingresar
        </RouterLink>
        <RouterLink to="/register" class="btn-primary px-3 py-1">
          Registrarse
        </RouterLink>
      </template>

      <template v-else>
        <RouterLink to="/profile" class="btn-outline px-3 py-1">
          Mi Perfil
        </RouterLink>
        
        <button @click="handleLogout" class="btn-ghost text-xs sm:text-sm px-2">
          Salir <span class="hidden sm:inline">({{ currentUser.email }})</span>
        </button>
      </template>
    </div>
  </nav>
</template>