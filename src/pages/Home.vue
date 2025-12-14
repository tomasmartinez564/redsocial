<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentUser } from '../services/auth' // Usamos tu servicio existente

const user = ref({ id: null })

onMounted(() => {
  // Verificamos quién es el usuario al cargar
  user.value = getCurrentUser()
})
</script>

<template>
  <section class="container-page grid gap-4 place-items-center min-h-[50vh]">
    <div class="card text-center max-w-lg p-8">
      <h2 class="text-3xl font-bold text-coffee-700">¡Bienvenidos a Coffee App! ☕</h2>
      <p class="muted mt-4 text-lg">
        La red social definitiva para fanáticos del café. Comparte tus experiencias, baristas y lugares favoritos.
      </p>

      <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <template v-if="user.id">
          <RouterLink to="/feed" class="btn-primary px-6 py-2">
            Ir al Feed
          </RouterLink>
          <RouterLink to="/chat" class="btn-outline px-6 py-2">
            Chat Global
          </RouterLink>
        </template>

        <template v-else>
          <RouterLink to="/login" class="btn-primary px-6 py-2">
            Iniciar Sesión
          </RouterLink>
          <RouterLink to="/register" class="btn-outline px-6 py-2">
            Crear Cuenta
          </RouterLink>
        </template>
      </div>
    </div>
  </section>
</template>