<script setup lang="ts">
import { RouterView } from 'vue-router'
import LoadingComponent from '@/components/LoadingComponent.vue'
</script>

<template>
  <router-view />
  <loading-component></loading-component>
</template>

<style scoped></style>
