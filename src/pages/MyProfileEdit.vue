<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyProfile, updateMyProfile } from '../services/user-profiles'
import { uploadFile, getFileURL } from '../services/storage'
import { getCurrentUser } from '../services/auth'

const router = useRouter()

const form = ref({
  display_name: '',
  bio: '',
  cafe_favorito: '',
  avatar_path: null
})

const avatarPreview = ref(null)
const newAvatarFile = ref(null)

const loading = ref(true)
const saving = ref(false)
const errorMsg = ref('')

function handleAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) {
    newAvatarFile.value = null
    avatarPreview.value = null
    return
  }
  newAvatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

onMounted(async () => {
  loading.value = true
  try {
    const profile = await getMyProfile()
    if (profile) {
      form.value.display_name = profile.display_name || ''
      form.value.bio = profile.bio || ''
      form.value.cafe_favorito = profile.cafe_favorito || ''
      form.value.avatar_path = profile.avatar_path || null
      if (profile.avatar_path) {
        avatarPreview.value = getFileURL(profile.avatar_path, 'avatars')
      }
    }
  } catch (err) {
    console.error(err)
    errorMsg.value = 'Error al cargar el perfil.'
  } finally {
    loading.value = false
  }
})

function generateAvatarFilename(userId, originalName) {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'jpg'
  const random = Math.random().toString(36).slice(2)
  const ts = Date.now()
  return `${userId}/${ts}-${random}.${ext}`
}

async function submit() {
  errorMsg.value = ''
  saving.value = true

  try {
    const u = getCurrentUser()
    const patch = {
      display_name: form.value.display_name.trim(),
      bio: form.value.bio.trim(),
      cafe_favorito: form.value.cafe_favorito.trim()
    }

    if (newAvatarFile.value && u.id) {
      const filename = generateAvatarFilename(u.id, newAvatarFile.value.name)
      await uploadFile(filename, newAvatarFile.value, 'avatars')
      patch.avatar_path = filename
    }

    await updateMyProfile(patch)
    router.push('/profile')
  } catch (err) {
    console.error(err)
    errorMsg.value = 'Ocurrió un error al guardar los cambios.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="container-page grid gap-4 max-w-xl mx-auto">
    <h2 class="text-2xl font-bold text-center">Editar perfil</h2>

    <p v-if="loading">Cargando…</p>
    <p v-else-if="errorMsg" class="text-red-500 text-center">{{ errorMsg }}</p>

    <form v-else class="card grid gap-4" @submit.prevent="submit">
      <!-- Avatar -->
      <div class="flex flex-col items-center gap-3">
        <div class="w-24 h-24 rounded-full bg-coffee-100 flex items-center justify-center overflow-hidden">
          <img
            v-if="avatarPreview"
            :src="avatarPreview"
            alt="Vista previa del avatar"
            class="w-full h-full object-cover"
          >
          <span v-else class="text-3xl font-semibold">
            {{ form.display_name?.[0]?.toUpperCase() || '?' }}
          </span>
        </div>
        <label class="btn-ghost text-sm cursor-pointer">
          Cambiar foto
          <input type="file" accept="image/*" class="hidden" @change="handleAvatarChange">
        </label>
      </div>

      <!-- Nombre -->
      <div class="grid gap-1 text-sm">
        <label class="font-semibold">Nombre para mostrar</label>
        <input
          v-model="form.display_name"
          type="text"
          class="input"
          maxlength="80"
        >
      </div>

      <!-- Café favorito -->
      <div class="grid gap-1 text-sm">
        <label class="font-semibold">Tu café favorito</label>
        <input
          v-model="form.cafe_favorito"
          type="text"
          class="input"
          maxlength="80"
        >
      </div>

      <!-- Bio -->
      <div class="grid gap-1 text-sm">
        <label class="font-semibold">Bio</label>
        <textarea
          v-model="form.bio"
          class="textarea"
          rows="3"
          maxlength="300"
        ></textarea>
      </div>

      <div class="flex gap-3 justify-end items-center">
        <RouterLink to="/profile" class="btn-ghost">Cancelar</RouterLink>
        <button type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Guardando…' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </section>
</template>
