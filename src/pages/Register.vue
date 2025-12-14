<script setup>
import { ref } from 'vue'
import { register } from '../services/auth'
import { useRouter } from 'vue-router'

const form = ref({ email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')
const router = useRouter()

async function onSubmit() {
  errorMsg.value = ''
  if (!form.value.email || !form.value.password) {
    errorMsg.value = 'Completá email y contraseña.'
    return
  }
  loading.value = true
  try {
    await register(form.value.email, form.value.password)
    router.push('/login') 
  } catch (e) {
    errorMsg.value = e?.message || 'Error al registrarse.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="container-page grid gap-4 max-w-md">
    <h2 class="text-2xl font-bold">Registro</h2>
    <form @submit.prevent="onSubmit" class="card grid gap-3" aria-labelledby="register-title">
      <label class="grid gap-1">
        <span>Email</span>
        <input class="input" type="email" v-model="form.email" autocomplete="email" />
      </label>
      <label class="grid gap-1">
        <span>Contraseña</span>
        <input class="input" type="password" v-model="form.password" autocomplete="new-password" />
      </label>
      <div class="flex items-center gap-3">
        <button class="btn-primary" :disabled="loading">{{ loading ? 'Creando…' : 'Crear cuenta' }}</button>
        <p v-if="errorMsg" class="text-red-600" aria-live="polite">{{ errorMsg }}</p>
      </div>
    </form>
  </section>
</template>