<script setup lang="ts">
/**
 * 全站共用 Header 元件
 * 顯示 Logo、系統標題、導覽按鈕，以及登入／登出功能
 */
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineProps<{
  /** 系統標題文字 */
  title: string
  /** 導覽按鈕清單（由父層依當前情境提供） */
  buttonList: {
    /** 按鈕顯示文字 */
    name: string
    /** 點擊後跳轉的路由路徑 */
    link: string
  }[]
}>()

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

/** 是否已登入 */
const isLogin = ref(userStore.isLogin)

/**
 * 跳轉至登入頁，並記錄當前路徑以便登入後返回
 */
function toLogin() {
  router.push('/login')
  userStore.setRedirect(route.fullPath)
}

/**
 * 執行登出，依目前所在區域決定跳轉目標（使用者前台或首頁）
 */
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
