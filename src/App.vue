<script setup lang="ts">
import { RouterView } from 'vue-router'
import LoadingCompontent from '@/components/LoadingCompontent.vue'
</script>

<template>
  <RouterView />
  <LoadingCompontent></LoadingCompontent>
</template>

<style scoped></style>
