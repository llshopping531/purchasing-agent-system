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
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="36" height="36" />
    <div class="title">{{ title }}</div>
    <nav>
      <a @click="toLogin()" v-if="!isLogin">登入</a>
      <router-link v-for="(btn, index) in buttonList" :to="btn.link" :key="index">
        {{ btn.name }}
      </router-link>
      <a @click="logout()" v-if="isLogin">登出</a>
    </nav>
  </header>
</template>
<style>
header {
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  height: 56px;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--color-border);
  gap: 0.75rem;
}

header .title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary-dark);
  letter-spacing: 0.04em;
  margin-left: 0.25rem;
}

header nav {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
  align-items: center;

  a,
  a.router-link-active {
    border: 1.5px solid var(--color-primary);
    color: var(--color-primary);
    padding: 0.3rem 0.9rem;
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.15s;
    background: transparent;

    &:hover {
      background: var(--color-primary);
      color: #fff;
    }
  }
}
</style>
