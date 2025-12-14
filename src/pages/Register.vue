<script setup>
import { ref, watch } from 'vue'
import { register } from '../services/auth' // Importamos la función de registro
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({ email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

// Limpiar el mensaje de error apenas el usuario modifique algo
watch(form, () => {
  if (errorMsg.value) errorMsg.value = ''
}, { deep: true })

async function onSubmit() {
  errorMsg.value = ''
  
  // Validación básica
  if (!form.value.email || !form.value.password) {
    errorMsg.value = 'Por favor, completá todos los campos.'
    return
  }
  
  loading.value = true
  
  try {
    await register(form.value.email, form.value.password)
    // Redirección exitosa al Muro (Feed)
    router.push('/feed') 
  } catch (e) {
    console.error(e)
    if (e.message.includes('already registered')) {
      errorMsg.value = 'Este email ya está registrado.'
    } else {
      errorMsg.value = 'Ocurrió un error al intentar registrarse.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="container-page flex justify-center items-center min-h-[60vh]">
    <div class="w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-6 text-coffee-700">Registrarse</h1>
      
      <form @submit.prevent="onSubmit" class="card grid gap-4 p-6 shadow-lg rounded-xl bg-white">
        
        <label class="grid gap-1">
          <span class="text-sm font-medium text-gray-700">Email</span>
          <input 
            class="input border rounded p-2 focus:ring-2 focus:ring-coffee-500 outline-none transition-colors" 
            :class="{'border-red-500 bg-red-50': errorMsg}"
            type="email" 
            v-model="form.email" 
            autocomplete="email" 
            placeholder="tu@email.com"
            :disabled="loading"
          />
        </label>
        
        <label class="grid gap-1">
          <span class="text-sm font-medium text-gray-700">Contraseña</span>
          <input 
            class="input border rounded p-2 focus:ring-2 focus:ring-coffee-500 outline-none transition-colors" 
            :class="{'border-red-500 bg-red-50': errorMsg}"
            type="password" 
            v-model="form.password" 
            autocomplete="new-password" 
            placeholder="********"
            :disabled="loading"
          />
        </label>
        
        <div v-if="errorMsg" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm text-center animate-pulse">
          {{ errorMsg }}
        </div>
        
        <button 
          class="btn-primary w-full py-2 font-bold flex justify-center items-center gap-2 mt-2" 
          :disabled="loading"
        >
          <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
        </button>

        <p class="text-center text-sm text-gray-500 mt-2">
          ¿Ya tienes cuenta? 
          <RouterLink to="/login" class="font-bold text-coffee-600 hover:underline">Inicia Sesión</RouterLink>
        </p>
      </form>
    </div>
  </section>
</template>