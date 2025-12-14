<script setup>
import AppLayout from './components/AppLayout.vue'
import { onMounted } from 'vue'
import { loadUserFromSupabase } from './services/auth'


onMounted(() => {
  loadUserFromSupabase()
})
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>
