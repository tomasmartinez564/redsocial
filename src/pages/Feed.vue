<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { listLatestPosts, subscribeToNewPosts } from '../services/posts.js'
import PostForm from '../components/PostForm.vue'
import PostCard from '../components/PostCard.vue'

const posts = ref([])
let unsubscribe = null

async function load() {
  posts.value = await listLatestPosts()
}

function onNewPost(row) {
  posts.value = [row, ...posts.value]
}

function onPostDeleted(id) {
  posts.value = posts.value.filter(p => p.id !== id)
}

function onPostUpdated(updated) {
  posts.value = posts.value.map(p =>
    p.id === updated.id ? { ...p, ...updated } : p
  )
}

onMounted(() => {
  load()
  unsubscribe = subscribeToNewPosts(onNewPost)
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <section class="container-page grid gap-4">
    <h2
      class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-coffee-700 to-coffee-500"
    >
      Feed
    </h2>

    <PostForm />

    <div class="grid gap-3">
      <PostCard
        v-for="p in posts"
        :key="p.id"
        :post="p"
        @deleted="onPostDeleted"
        @updated="onPostUpdated"
      />
    </div>
  </section>
</template>
