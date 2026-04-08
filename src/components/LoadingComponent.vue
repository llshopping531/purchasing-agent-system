<script setup lang="ts">
import { watch } from 'vue'
import IconLoading from '@/components/icons/IconLoading.vue'
import MaskComponent from '@/components/MaskComponent.vue'
import { useLoadingStore } from '@/stores/loading'
import { useModalLayer } from '@/composables/useModalLayer'

const loadingStore = useLoadingStore()
const { acquire, release } = useModalLayer()

watch(
  () => loadingStore.isLoading,
  (val) => {
    if (val) acquire()
    else release()
  },
)
</script>
<template>
  <div class="loading" v-if="loadingStore.isLoading">
    <mask-component :zIndex="290"></mask-component>
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

  .loading-icon {
    position: relative;
    z-index: 301;
  }
}
</style>
