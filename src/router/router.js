import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import GlobalChat from '../pages/GlobalChat.vue' // Asegúrate que tu archivo se llame así (antes trabajamos en Chat.vue)
import MyProfile from '../pages/MyProfile.vue'   // Asegúrate que tu archivo se llame así (antes trabajamos en Profile.vue)
import MyProfileEdit from '../pages/MyProfileEdit.vue' // Asegúrate que tu archivo se llame así
import Feed from '../pages/Feed.vue' 
import ChangePasswordForm from '../components/ChangePasswordForm.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  { path: '/chat', name: 'global-chat', component: GlobalChat },
  { path: '/profile', name: 'profile', component: MyProfile },
  { path: '/profile/edit', name: 'profile-edit', component: MyProfileEdit },
  { path: '/feed', name: 'feed', component: Feed },
  { path: '/u/:id', name: 'user-profile', component: () => import('../pages/UserProfile.vue') },
  { path: '/profile/change-password', name: 'change-password', component: ChangePasswordForm },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router