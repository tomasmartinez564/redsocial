<script setup></script>

<template>
  <section class="container-page grid gap-4">
    <div class="card text-center">
      <h2 class="text-2xl font-bold">¡Bienvenidos!</h2>
      <p class="muted mt-2">
        Coffee App, es una red social para fanaticos del cafe y sus experiencias.
      </p>

      <div class="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
        <RouterLink to="/feed" class="btn-primary">Ir al Feed</RouterLink>
        <RouterLink to="/chat" class="btn-outline">Chat Global</RouterLink>
      </div>
    </div>
  </section>
</template>
