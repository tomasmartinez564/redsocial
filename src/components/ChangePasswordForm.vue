<script setup>
import { ref } from 'vue'
import { changePassword } from '../services/auth'

const pass = ref('')
const pass2 = ref('')
const loading = ref(false)
const msg = ref('')
const err = ref('')

async function submit() {
  msg.value = ''; err.value = ''
  if (!pass.value || pass.value.length < 6) { err.value = 'Mínimo 6 caracteres.'; return }
  if (pass.value !== pass2.value) { err.value = 'Las contraseñas no coinciden.'; return }
  loading.value = true
  try {
    await changePassword(pass.value) 
    msg.value = 'Contraseña actualizada.'
    pass.value = ''; pass2.value = ''
  } catch (e) {
    err.value = e?.message || 'No se pudo actualizar.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="grid gap-3">
    <label class="grid gap-1">
      <span>Nueva contraseña</span>
      <input type="password" v-model="pass" class="input" autocomplete="new-password" />
    </label>
    <label class="grid gap-1">
      <span>Repetir contraseña</span>
      <input type="password" v-model="pass2" class="input" autocomplete="new-password" />
    </label>
    <div class="flex items-center gap-3">
      <button class="btn-primary" :disabled="loading">
        {{ loading ? 'Guardando…' : 'Actualizar' }}
      </button>
      <p v-if="err" class="text-red-600">{{ err }}</p>
      <p v-if="msg" class="text-green-700">{{ msg }}</p>
    </div>
  </form>
</template>
