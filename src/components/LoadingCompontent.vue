<script setup lang="ts">
import IconLoading from '@/components/icons/IconLoading.vue'
import MaskCompontent from '@/components/MaskCompontent.vue'
import { useLoadingStore } from '@/stores/loading';

const loadingStore = useLoadingStore()
</script>
<template>
  <div class="loading" v-if="loadingStore.isLoading">
    <MaskCompontent></MaskCompontent>
    <div class="icon">
      <IconLoading></IconLoading>
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
