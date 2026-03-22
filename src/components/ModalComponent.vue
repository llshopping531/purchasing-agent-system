<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>
<template>
  <div class="modal">
    <div class="title">{{ name }}</div>
我累了休息一下

    <div class="btnBox">
      <div class="btn">確定</div>
      <div class="btn">取消</div>
    </div>
  </div>
</template>
<style>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  box-shadow: 1rem 1rem 0.5rem #8cbfa44a;
  width: 80%;
  height: 80%;
  padding: 1rem;
  .title {
    text-align: center;
    font-size: 2rem;
  }
  .btnBox {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
}
</style>
