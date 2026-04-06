<script setup lang="ts">
/**
 * 使用者前台 Layout
 * 根據登入狀態與管理員身分動態產生 Header 的導覽按鈕
 */
import HeaderComponent from '@/components/HeaderComponent.vue'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()

/**
 * 依登入狀態與當前路徑動態決定 Header 顯示的按鈕清單
 * - 已登入且不在會員中心：顯示「會員中心」
 * - 已登入且為管理員：顯示「前往後台管理系統」
 */
const headerBtn = computed(() => {
  const btnList = []
  if (userStore.isLogin) {
    if (!route.fullPath.includes('/disboard'))
      btnList.push({ name: '會員中心', link: '/user/disboard' })
    if (userStore.isAdmin) btnList.push({ name: '前往後台管理系統', link: '/admin' })
  }
  return btnList
})
</script>
<template>
  <header-component title="ㄌㄌ代購 使用者前台系統" :buttonList="headerBtn"></header-component>
  <main>
    <router-view />
  </main>
</template>

<style></style>
