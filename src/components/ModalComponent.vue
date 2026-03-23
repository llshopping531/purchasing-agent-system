<script setup lang="ts">
defineProps<{
  name: string
  width?: string
}>()
const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function confirm() {
  emit('confirm')
}
function cancel() {
  emit('cancel')
}
</script>
<template>
  <div class="mask"></div>
  <div class="modal" :style="{ width: width }">
    <div class="title">{{ name }}</div>
    <slot name="content"></slot>
    <div class="btnBox">
      <div class="btn" @click="confirm">確定</div>
      <div class="btn" @click="cancel">取消</div>
    </div>
  </div>
</template>
<style>
.mask{
      position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #33333345;
    overflow: hidden;
}
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  box-shadow: 1rem 1rem 0.5rem #8887874a;
  width: 700px;
  max-width: 80%;
  max-height: 80%;
  padding: 1rem;
  .title {
    text-align: center;
    font-size: 2rem;
  }
  .btnBox {
    margin-top: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
}
</style>
