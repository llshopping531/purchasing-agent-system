<script setup lang="ts">
import HeaderComponent from '@/components/HeaderComponent.vue'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const userStore = useUserStore()
const route = useRoute()
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
  <HeaderComponent title="ㄌㄌ代購 使用者前台系統" :buttonList="headerBtn"></HeaderComponent>
  <main>
    <RouterView />
  </main>
</template>

<style></style>
