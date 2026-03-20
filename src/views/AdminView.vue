<script setup lang="ts">
import HeaderComponent from '@/components/HeaderComponent.vue'

const buttonList = [{ name: '前往使用者前台系統', link: '/user' }]
</script>

<template>
  <HeaderComponent title="ㄌㄌ代購 管理者後台系統" :buttonList="buttonList"></HeaderComponent>
  <main>
    <RouterView />
  </main>
</template>
