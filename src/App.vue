<script setup lang="ts">
import { RouterView } from 'vue-router'
import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorModalComponent from '@/components/ErrorModalComponent.vue'
</script>

<template>
  <router-view />
  <loading-component></loading-component>
  <error-modal-component></error-modal-component>
</template>

<style scoped></style>
