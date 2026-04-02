<script setup lang="ts">
import IconLoading from '@/components/icons/IconLoading.vue'
import MaskComponent from '@/components/MaskComponent.vue'
import { useLoadingStore } from '@/stores/loading';

const loadingStore = useLoadingStore()
</script>
<template>
  <div class="loading" v-if="loadingStore.isLoading">
    <mask-component></mask-component>
    <div class="icon">
      <icon-loading></icon-loading>
    </div>
  </div>
</template>
<style>
.loading {
  .icon {
    position: absolute;
    top: 50%;
    left: 50%;
  }
}
</style>
