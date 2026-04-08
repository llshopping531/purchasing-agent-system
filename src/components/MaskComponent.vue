<script setup lang="ts">
defineProps<{
  /** 遮罩的 z-index，由父層依層級計算後傳入 */
  zIndex?: number
}>()
</script>

<template>
  <div class="mask" :style="{ zIndex: zIndex ?? 200 }"></div>
</template>
<style>
.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(45, 36, 88, 0.45);
  backdrop-filter: blur(3px);
}
</style>
