<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { changePassword } from '../services/auth'

const router = useRouter()

// CAMBIO: Nombres descriptivos para las variables
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function handleSubmit() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!newPassword.value || newPassword.value.length < 6) {
    errorMessage.value = 'Mínimo 6 caracteres.'
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  loading.value = true

  try {
    await changePassword(newPassword.value)
    
    successMessage.value = '¡Contraseña actualizada! Volviendo...'
    newPassword.value = ''
    confirmPassword.value = ''

    setTimeout(() => {
      router.push('/profile')
    }, 2000)

  } catch (error) {
    console.error(error)
    errorMessage.value = error?.message || 'No se pudo actualizar.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="container-page flex justify-center items-center min-h-[50vh]">
    <div class="w-full max-w-md">
      
      <h1 class="text-3xl font-bold text-center mb-6 text-coffee-700">
        Cambiar contraseña
      </h1>

      <form @submit.prevent="handleSubmit" class="card grid gap-4 p-6 shadow-lg rounded-xl bg-white">
        
        <label class="grid gap-1">
          <span class="text-sm font-medium text-gray-700">Nueva contraseña</span>
          <input 
            type="password" 
            v-model="newPassword" 
            class="input border rounded p-2 focus:ring-2 focus:ring-coffee-500 outline-none" 
            autocomplete="new-password"
            placeholder="Mínimo 6 caracteres"
            :disabled="loading" 
          />
        </label>

        <label class="grid gap-1">
          <span class="text-sm font-medium text-gray-700">Repetir contraseña</span>
          <input 
            type="password" 
            v-model="confirmPassword" 
            class="input border rounded p-2 focus:ring-2 focus:ring-coffee-500 outline-none" 
            autocomplete="new-password" 
            placeholder="Repite la contraseña"
            :disabled="loading"
          />
        </label>

        <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm text-center animate-pulse">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm text-center">
          {{ successMessage }}
        </div>

        <div class="flex gap-3 mt-2">
          <button 
            type="button" 
            class="btn-ghost flex-1" 
            @click="router.push('/profile')"
            :disabled="loading"
          >
            Cancelar
          </button>
          
          <button 
            class="btn-primary flex-1 flex justify-center items-center gap-2" 
            :disabled="loading"
          >
             <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
             {{ loading ? 'Guardando...' : 'Actualizar' }}
          </button>
        </div>

      </form>
    </div>
  </section>
</template>