<script setup>
import AppNavbar from './AppNavbar.vue'
import AppFooter from './AppFooter.vue'
</script>

<template>
  <div class="min-h-screen grid grid-rows-[60px_1fr_100px]">
    <AppNavbar />
    <main class="p-4">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>


