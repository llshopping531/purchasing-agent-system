<script setup lang="ts">
import IconLoading from '@/components/icons/IconLoading.vue'
import MaskComponent from '@/components/MaskComponent.vue'
import { useLoadingStore } from '@/stores/loading';

const loadingStore = useLoadingStore()
</script>
<template>
  <div class="loading" v-if="loadingStore.isLoading">
    <mask-component></mask-component>
    <div class="loading-icon">
      <icon-loading></icon-loading>
    </div>
  </div>
</template>
<style>
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  pointer-events: none;

  .loading-icon {
    position: relative;
    z-index: 301;
  }
}
</style>
