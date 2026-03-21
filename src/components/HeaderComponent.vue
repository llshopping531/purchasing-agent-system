<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineProps<{
  title: string
  buttonList: {
    name: string
    link: string
  }[]
}>()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const isLogin = ref(userStore.isLogin)
function toLogin() {
  router.push('/login')
  userStore.setRedirect(route.fullPath)
}
function logout() {
  userStore.logout()
  if (route.fullPath.includes('/user')) {
    router.push('/user')
  } else {
    router.push('/')
  }
}
</script>
<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="50" height="50" />
    <div class="title">{{ title }}</div>
    <nav>
      <a @click="toLogin()" v-if="!isLogin">
        登入
      </a>
      <RouterLink v-for="(btn, index) in buttonList" :to="btn.link" :key="index">
        {{ btn.name }}
      </RouterLink>
      <a @click="logout()" v-if="isLogin">
        登出
      </a>
    </nav>
  </header>
</template>
<style>
  header {
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
  }
  .title {
    font-size: 1.2rem;
  }
  nav {
    margin-left: auto;
    display: flex;
    gap: 1rem;
    a {
      border: 1px solid #00bd7e;
      padding: 0.25rem 0.75rem;
    }
  }
</style>
